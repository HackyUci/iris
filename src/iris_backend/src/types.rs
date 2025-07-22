use candid::{CandidType, Deserialize};
use serde::Serialize;

pub type Result<T> = std::result::Result<T, String>;
pub type IrisResult<T> = std::result::Result<T, crate::utils::errors::IrisError>;

pub type InvoiceId = String;
pub type MerchantId = String;
pub type UserId = String;
pub type BitcoinAddressString = String;
pub type CashoutId = String;

pub type SatoshiAmount = u64;
pub type FiatAmount = f64;
pub type Timestamp = u64;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct PaginationParams {
    pub offset: u64,
    pub limit: u64,
}

impl Default for PaginationParams {
    fn default() -> Self {
        Self {
            offset: 0,
            limit: 10,
        }
    }
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub total: u64,
    pub offset: u64,
    pub limit: u64,
}

impl<T> PaginatedResponse<T> {
    pub fn new(data: Vec<T>, total: u64, offset: u64, limit: u64) -> Self {
        Self {
            data,
            total,
            offset,
            limit,
        }
    }
}