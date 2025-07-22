use candid::{CandidType, Deserialize};
use serde::Serialize;
use crate::models::enums::{Currency, PaymentStatus};

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Invoice {
    pub id: String,
    pub merchant_id: String,
    pub amount_satoshi: u64,
    pub bitcoin_address: String,
    pub status: PaymentStatus,
    pub created_at: u64,
    pub updated_at: u64,
    pub description: Option<String>,
    pub currency: Currency,
    pub fiat_amount: f64,
}

impl Invoice {
    pub fn new(
        id: String,
        merchant_id: String,
        amount_satoshi: u64,
        bitcoin_address: String,
        created_at: u64,
        description: Option<String>,
        currency: Currency,
        fiat_amount: f64,
    ) -> Self {
        Self {
            id,
            merchant_id,
            amount_satoshi,
            bitcoin_address,
            status: PaymentStatus::Pending,
            created_at,
            updated_at: created_at,
            description,
            currency,
            fiat_amount,
        }
    }
    
    pub fn amount_btc(&self) -> f64 {
        self.amount_satoshi as f64 / 100_000_000.0
    }
    
    pub fn update_status(&mut self, status: PaymentStatus, timestamp: u64) -> Result<(), String> {
        self.status = status;
        self.updated_at = timestamp;
        Ok(())
    }
}

#[derive(CandidType, Deserialize)]
pub struct CreateInvoiceRequest {
    pub merchant_id: String,
    pub fiat_amount: f64,
    pub currency: Currency,
    pub description: Option<String>,
}