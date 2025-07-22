use crate::models::{Invoice, PaymentStatus};

pub struct InvoiceService;

impl InvoiceService {
    pub fn generate_invoice_id(counter: u64) -> String {
        format!("INV-{:08}", counter)
    }
    
    pub async fn check_invoice_payment(invoice: &mut Invoice) -> Result<PaymentStatus, String> {
        Ok(invoice.status.clone())
    }
    
    pub fn filter_merchant_invoices(all_invoices: &[Invoice], merchant_id: &str) -> Vec<Invoice> {
        all_invoices
            .iter()
            .filter(|invoice| invoice.merchant_id == merchant_id)
            .cloned()
            .collect()
    }
}