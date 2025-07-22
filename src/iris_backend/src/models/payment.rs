use candid::{CandidType, Deserialize};
use serde::Serialize;

#[derive(CandidType, Deserialize)]
pub struct MockUSDPaymentRequest {
    pub invoice_id: String,
    pub usd_amount: f64,
}