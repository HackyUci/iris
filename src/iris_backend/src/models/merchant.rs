use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;
use crate::models::enums::{Currency, CashoutStatus};

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct MerchantProfile {
    pub merchant_principal: Principal,
    pub business_name: String,
    pub created_at: u64,
    pub total_invoices: u64,
    pub static_bitcoin_address: String,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct MerchantBalance {
    pub merchant_principal: Principal,
    pub total_satoshi: u64,
    pub pending_satoshi: u64,
    pub confirmed_satoshi: u64,
    pub preferred_currency: Currency,
    pub last_updated: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct MerchantDashboard {
    pub total_invoices: u64,
    pub pending_payments: u64,
    pub completed_payments: u64,
    pub total_balance_satoshi: u64,
    pub total_balance_fiat: f64,
    pub preferred_currency: Currency,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CashoutRequest {
    pub id: String,
    pub merchant_principal: Principal,
    pub amount_satoshi: u64,
    pub target_currency: Currency,
    pub fiat_amount: f64,
    pub status: CashoutStatus,
    pub created_at: u64,
    pub bank_details: Option<String>,
}

#[derive(CandidType, Deserialize)]
pub struct CreateMerchantRequest {
    pub business_name: String,
}

#[derive(CandidType, Deserialize)]
pub struct CreateCashoutRequest {
    pub amount_satoshi: u64,
    pub target_currency: Currency,
    pub bank_details: Option<String>,
}