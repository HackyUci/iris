use candid::{CandidType, Deserialize};
use serde::Serialize;
use crate::models::payment::PaymentStatus;

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
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CreateInvoiceRequest {
    pub merchant_id: String,
    pub amount_satoshi: u64,
    pub description: Option<String>,
}

impl Invoice {
    pub fn new(
        id: String,
        merchant_id: String,
        amount_satoshi: u64,
        bitcoin_address: String,
        timestamp: u64,
        description: Option<String>,
    ) -> Self {
        Self {
            id,
            merchant_id,
            amount_satoshi,
            bitcoin_address,
            status: PaymentStatus::Pending,
            created_at: timestamp,
            updated_at: timestamp,
            description,
        }
    }
    
    pub fn update_status(&mut self, new_status: PaymentStatus, timestamp: u64) -> Result<(), String> {
        if self.status.can_transition_to(&new_status) {
            self.status = new_status;
            self.updated_at = timestamp;
            Ok(())
        } else {
            Err(format!("Cannot transition from {:?} to {:?}", self.status, new_status))
        }
    }
    
    pub fn is_expired(&self, current_time: u64, expiry_seconds: u64) -> bool {
        current_time > self.created_at + expiry_seconds * 1_000_000_000
    }
    
    pub fn amount_btc(&self) -> f64 {
        self.amount_satoshi as f64 / 100_000_000.0
    }
}