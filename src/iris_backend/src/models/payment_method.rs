use candid::{CandidType, Deserialize};
use serde::Serialize;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum PaymentMethod {
    VirtualWallet,
    PlugWallet,
    MockUSD,
    ExternalWallet,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct PaymentRequest {
    pub invoice_id: String,
    pub payment_method: PaymentMethod,
    pub usd_amount: Option<f64>,
}

#[derive(CandidType, Deserialize)]
pub struct MockUSDPaymentRequest {
    pub invoice_id: String,
    pub usd_amount: f64,
}