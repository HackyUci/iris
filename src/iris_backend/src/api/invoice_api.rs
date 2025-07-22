use candid::candid_method;
use ic_cdk::api::time;
use ic_cdk_macros::{query, update};
use crate::models::*;
use crate::services::*;
use crate::storage::*;
use crate::api::{get_caller_principal, get_user_role};

#[update]
#[candid_method(update)]
pub async fn create_invoice(request: CreateInvoiceRequest) -> Result<Invoice, String> {
    let user_role = get_user_role()?;
    if user_role != UserRole::Merchant {
        return Err("Only merchants can create invoices".to_string());
    }
    
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let merchant = MERCHANT_PROFILES.with(|profiles| {
        profiles.borrow().get(&principal_string).cloned()
    }).ok_or("Merchant not registered. Please register first.")?;
    
    let invoice_id = INVOICE_COUNTER.with(|counter| {
        let mut c = counter.borrow_mut();
        *c += 1;
        InvoiceService::generate_invoice_id(*c)
    });
    
    let current_time = time();
    let amount_satoshi = ExchangeService::fiat_to_satoshi(request.fiat_amount, &request.currency);
    
    let invoice = Invoice::new(
        invoice_id.clone(),
        principal_string.clone(),
        amount_satoshi,
        merchant.static_bitcoin_address,
        current_time,
        request.description,
        request.currency,
        request.fiat_amount,
    );
    
    INVOICES.with(|invoices| {
        invoices.borrow_mut().insert(invoice_id.clone(), invoice.clone());
    });
    
    MERCHANT_PROFILES.with(|profiles| {
        let mut profiles_map = profiles.borrow_mut();
        if let Some(merchant) = profiles_map.get_mut(&principal_string) {
            merchant.total_invoices += 1;
        }
    });
    
    Ok(invoice)
}

#[query]
#[candid_method(query)]
pub fn get_invoice(invoice_id: String) -> Result<Invoice, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found".to_string())?;
    
    if invoice.merchant_id != principal_string {
        return Err("Unauthorized: Invoice does not belong to you".to_string());
    }
    
    Ok(invoice)
}

#[query]
#[candid_method(query)]
pub fn get_my_invoices() -> Result<Vec<Invoice>, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let invoices = INVOICES.with(|invoices| {
        let all_invoices: Vec<Invoice> = invoices.borrow().values().cloned().collect();
        InvoiceService::filter_merchant_invoices(&all_invoices, &principal_string)
    });
    
    Ok(invoices)
}

#[query]
#[candid_method(query)]
pub fn get_invoice_by_qr_scan(invoice_id: String) -> Result<Invoice, String> {
    INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found".to_string())
}

#[query]
#[candid_method(query)]
pub fn get_invoice_payment_info(invoice_id: String) -> Result<String, String> {
    let invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
    let btc_amount = invoice.amount_btc();
    let usd_equivalent = ExchangeService::satoshi_to_fiat(invoice.amount_satoshi, &Currency::USD);
    
    let info = format!(
        "Invoice: {} | Amount: {} BTC ({:.2} USD) | Address: {} | Status: {:?}",
        invoice.id,
        btc_amount,
        usd_equivalent,
        invoice.bitcoin_address,
        invoice.status
    );
    
    Ok(info)
}