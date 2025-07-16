mod models;
mod services;

use candid::candid_method;
use ic_cdk::api::time;
use ic_cdk_macros::{init, query, update};
use std::cell::RefCell;
use std::collections::HashMap;
use models::*;
use services::*;

thread_local! {
    static INVOICES: RefCell<HashMap<String, Invoice>> = RefCell::new(HashMap::new());
    static INVOICE_COUNTER: RefCell<u64> = RefCell::new(0);
}

#[init]
fn init() {
    ic_cdk::println!("Iris Backend initialized");
}

#[update]
#[candid_method(update)]
async fn create_invoice(request: CreateInvoiceRequest) -> Result<Invoice, String> {
    let invoice_id = INVOICE_COUNTER.with(|counter| {
        let mut c = counter.borrow_mut();
        *c += 1;
        InvoiceService::generate_invoice_id(*c)
    });
    
    let invoice = InvoiceService::create_invoice(request, invoice_id.clone()).await?;
    
    INVOICES.with(|invoices| {
        invoices.borrow_mut().insert(invoice_id.clone(), invoice.clone());
    });
    
    Ok(invoice)
}

#[update]
#[candid_method(update)]
async fn generate_qr_code(invoice_id: String) -> Result<QRCodeData, String> {
    let invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
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
async fn check_payment(invoice_id: String) -> Result<PaymentStatus, String> {
    let mut invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
    let new_status = InvoiceService::check_invoice_payment(&mut invoice).await?;
    
    INVOICES.with(|invoices| {
        invoices.borrow_mut().insert(invoice_id, invoice);
    });
    
    Ok(new_status)
}

#[query]
#[candid_method(query)]
fn get_invoice(invoice_id: String) -> Result<Invoice, String> {
    INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found".to_string())
}

#[query]
#[candid_method(query)]
fn get_merchant_invoices(merchant_id: String) -> Vec<Invoice> {
    INVOICES.with(|invoices| {
        let all_invoices: Vec<Invoice> = invoices.borrow().values().cloned().collect();
        InvoiceService::filter_merchant_invoices(&all_invoices, &merchant_id)
    })
}

#[update]
#[candid_method(update)]
async fn get_bitcoin_balance(address: String) -> Result<u64, String> {
    BitcoinService::get_bitcoin_balance(&address).await
}

#[update]
#[candid_method(update)]
async fn get_bitcoin_utxos(address: String) -> Result<Vec<BitcoinUtxo>, String> {
    BitcoinService::get_bitcoin_utxos(&address).await
}

#[query]
#[candid_method(query)]
fn greet(name: String) -> String {
    format!("Hello, {}! Welcome to Iris Bitcoin Payment System.", name)
}

candid::export_service!();

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}