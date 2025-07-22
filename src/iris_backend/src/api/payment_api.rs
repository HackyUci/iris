use candid::candid_method;
use ic_cdk::api::time;
use ic_cdk_macros::{query, update};
use crate::models::*;
use crate::services::*;
use crate::storage::*;
use crate::api::{get_caller_principal, get_user_role};

#[update]
#[candid_method(update)]
pub async fn generate_qr_code(invoice_id: String) -> Result<QRCodeData, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
    if invoice.merchant_id != principal_string {
        return Err("Unauthorized: Invoice does not belong to you".to_string());
    }
    
    let qr_request = QRCodeRequest::new(
        invoice.bitcoin_address.clone(),
        invoice.amount_satoshi,
        invoice_id,
    );
    
    let qr_data = QRService::generate_qr_code(qr_request);
    
    Ok(qr_data)
}

#[update]
#[candid_method(update)]
pub async fn generate_invoice_qr(invoice_id: String) -> Result<QRCodeData, String> {
    let user_role = get_user_role()?;
    if user_role != UserRole::Merchant {
        return Err("Only merchants can generate invoice QR".to_string());
    }
    
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
    if invoice.merchant_id != principal_string {
        return Err("Unauthorized: Invoice does not belong to you".to_string());
    }
    
    let qr_request = QRCodeRequest::new(
        invoice.bitcoin_address.clone(),
        invoice.amount_satoshi,
        invoice_id,
    ).with_message(format!("Pay {} {}", invoice.fiat_amount, format!("{:?}", invoice.currency)));
    
    let qr_data = QRService::generate_qr_code(qr_request);
    Ok(qr_data)
}

#[update]
#[candid_method(update)]
pub async fn check_payment(invoice_id: String) -> Result<PaymentStatus, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let mut invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
    if invoice.merchant_id != principal_string {
        return Err("Unauthorized: Invoice does not belong to you".to_string());
    }
    
    let old_status = invoice.status.clone();
    let new_status = InvoiceService::check_invoice_payment(&mut invoice).await?;
    
    INVOICES.with(|invoices| {
        invoices.borrow_mut().insert(invoice_id.clone(), invoice.clone());
    });
    
    if old_status != new_status {
        update_merchant_balance(invoice_id).await?;
    }
    
    Ok(new_status)
}

#[update]
#[candid_method(update)]
pub async fn check_invoice_status(invoice_id: String) -> Result<PaymentStatus, String> {
    let invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
    Ok(invoice.status)
}

#[update]
#[candid_method(update)]
pub async fn simulate_payment(invoice_id: String) -> Result<PaymentStatus, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let mut invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
    if invoice.merchant_id != principal_string {
        return Err("Unauthorized: Invoice does not belong to you".to_string());
    }
    
    let current_time = time();
    invoice.update_status(PaymentStatus::Completed, current_time)?;
    
    INVOICES.with(|invoices| {
        invoices.borrow_mut().insert(invoice_id.clone(), invoice.clone());
    });
    
    update_merchant_balance(invoice_id).await?;
    
    Ok(PaymentStatus::Completed)
}

#[update]
#[candid_method(update)]
pub async fn simulate_payment_confirmed(invoice_id: String) -> Result<PaymentStatus, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let mut invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
    if invoice.merchant_id != principal_string {
        return Err("Unauthorized: Invoice does not belong to you".to_string());
    }
    
    let current_time = time();
    invoice.update_status(PaymentStatus::Confirmed, current_time)?;
    
    INVOICES.with(|invoices| {
        invoices.borrow_mut().insert(invoice_id.clone(), invoice.clone());
    });
    
    update_merchant_balance(invoice_id).await?;
    
    Ok(PaymentStatus::Confirmed)
}

#[update]
#[candid_method(update)]
pub async fn simulate_usd_payment(request: MockUSDPaymentRequest) -> Result<PaymentStatus, String> {
    let user_role = get_user_role()?;
    if user_role != UserRole::Customer {
        return Err("Only customers can make payments".to_string());
    }
    
    let mut invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&request.invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
    let btc_rate = ExchangeService::get_btc_rate(&Currency::USD);
    let btc_amount = request.usd_amount / btc_rate;
    let satoshi_amount = (btc_amount * 100_000_000.0) as u64;
    
    if satoshi_amount >= invoice.amount_satoshi {
        let current_time = time();
        
        if invoice.status == PaymentStatus::Pending {
            invoice.update_status(PaymentStatus::Confirmed, current_time)?;
        } else if invoice.status == PaymentStatus::Confirmed {
            invoice.update_status(PaymentStatus::Completed, current_time)?;
        }
        
        INVOICES.with(|invoices| {
            invoices.borrow_mut().insert(request.invoice_id.clone(), invoice.clone());
        });
        
        update_merchant_balance(request.invoice_id).await?;
        Ok(invoice.status)
    } else {
        Err("Insufficient USD amount".to_string())
    }
}

#[update]
#[candid_method(update)]
pub async fn simulate_plug_wallet_payment(invoice_id: String) -> Result<PaymentStatus, String> {
    let user_role = get_user_role()?;
    if user_role != UserRole::Customer {
        return Err("Only customers can make payments".to_string());
    }
    
    let mut invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
    let current_time = time();
    
    if invoice.status == PaymentStatus::Pending {
        invoice.update_status(PaymentStatus::Confirmed, current_time)?;
    } else if invoice.status == PaymentStatus::Confirmed {
        invoice.update_status(PaymentStatus::Completed, current_time)?;
    }
    
    INVOICES.with(|invoices| {
        invoices.borrow_mut().insert(invoice_id.clone(), invoice.clone());
    });
    
    update_merchant_balance(invoice_id).await?;
    Ok(invoice.status)
}

#[update]
#[candid_method(update)]
pub async fn simulate_external_wallet_payment(invoice_id: String) -> Result<PaymentStatus, String> {
    let user_role = get_user_role()?;
    if user_role != UserRole::Customer {
        return Err("Only customers can make payments".to_string());
    }
    
    let mut invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
    let current_time = time();
    invoice.update_status(PaymentStatus::Confirmed, current_time)?;
    
    INVOICES.with(|invoices| {
        invoices.borrow_mut().insert(invoice_id.clone(), invoice.clone());
    });
    
    update_merchant_balance(invoice_id).await?;
    Ok(PaymentStatus::Confirmed)
}

#[update]
#[candid_method(update)]
pub async fn track_payment_to_static_address(bitcoin_address: String, invoice_id: String) -> Result<(), String> {
    STATIC_PAYMENTS.with(|payments| {
        let mut payments_map = payments.borrow_mut();
        payments_map.entry(bitcoin_address).or_insert_with(Vec::new).push(invoice_id);
    });
    Ok(())
}

#[query]
#[candid_method(query)]
pub fn get_payments_for_address(bitcoin_address: String) -> Vec<String> {
    STATIC_PAYMENTS.with(|payments| {
        payments.borrow().get(&bitcoin_address).cloned().unwrap_or_default()
    })
}

#[query]
#[candid_method(query)]
pub fn get_payment_methods() -> Vec<PaymentMethod> {
    vec![
        PaymentMethod::VirtualWallet,
        PaymentMethod::PlugWallet,
        PaymentMethod::MockUSD,
        PaymentMethod::ExternalWallet,
    ]
}

#[query]
#[candid_method(query)]
pub fn get_usd_to_btc_rate() -> f64 {
    ExchangeService::get_btc_rate(&Currency::USD)
}

#[query]
#[candid_method(query)]
pub fn convert_usd_to_satoshi(usd_amount: f64) -> u64 {
    ExchangeService::fiat_to_satoshi(usd_amount, &Currency::USD)
}

#[query]
#[candid_method(query)]
pub fn get_all_currencies() -> Vec<Currency> {
    vec![Currency::USD, Currency::GBP, Currency::SGD, Currency::IDR]
}

async fn update_merchant_balance(invoice_id: String) -> Result<(), String> {
    let invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
    let merchant_principal = candid::Principal::from_text(&invoice.merchant_id)
        .map_err(|_| "Invalid merchant principal")?;
    
    MERCHANT_BALANCES.with(|balances| {
        let mut balances_map = balances.borrow_mut();
        let current_time = time();
        
        let balance = balances_map.entry(invoice.merchant_id.clone()).or_insert(MerchantBalance {
            merchant_principal,
            total_satoshi: 0,
            pending_satoshi: 0,
            confirmed_satoshi: 0,
            preferred_currency: Currency::USD,
            last_updated: current_time,
        });
        
        match invoice.status {
            PaymentStatus::Confirmed => {
                balance.pending_satoshi += invoice.amount_satoshi;
            },
            PaymentStatus::Completed => {
                balance.confirmed_satoshi += invoice.amount_satoshi;
                balance.total_satoshi += invoice.amount_satoshi;
            },
            _ => {}
        }
        
        balance.last_updated = current_time;
    });
    
    Ok(())
}