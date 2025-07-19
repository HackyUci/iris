use crate::models::{Invoice, CreateInvoiceRequest, PaymentStatus};
use crate::services::{BitcoinService, ExchangeService};
use ic_cdk::api::time;

pub struct InvoiceService;

impl InvoiceService {
    pub async fn create_invoice(request: CreateInvoiceRequest, invoice_id: String) -> Result<Invoice, String> {
        let bitcoin_address = BitcoinService::generate_bitcoin_address().await?;
        let current_time = time();
        
        let amount_satoshi = ExchangeService::fiat_to_satoshi(request.fiat_amount, &request.currency);
        
        let invoice = Invoice::new(
            invoice_id,
            request.merchant_id,
            amount_satoshi,
            bitcoin_address.address,
            current_time,
            request.description,
            request.currency,
            request.fiat_amount,
        );
        
        Ok(invoice)
    }
    
    pub async fn check_invoice_payment(invoice: &mut Invoice) -> Result<PaymentStatus, String> {
        let new_status = BitcoinService::check_payment_status(
            &invoice.bitcoin_address,
            invoice.amount_satoshi,
        ).await?;
        
        if new_status != invoice.status {
            let current_time = time();
            invoice.update_status(new_status.clone(), current_time)?;
        }
        
        Ok(new_status)
    }
    
    pub fn filter_merchant_invoices(invoices: &[Invoice], merchant_id: &str) -> Vec<Invoice> {
        invoices
            .iter()
            .filter(|invoice| invoice.merchant_id == merchant_id)
            .cloned()
            .collect()
    }
    
    pub fn generate_invoice_id(counter: u64) -> String {
        format!("INV-{:06}", counter)
    }
}