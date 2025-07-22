use candid::CandidType;
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub enum IrisError {
    Unauthorized(String),
    NotFound(String),
    InvalidInput(String),
    BitcoinError(String),
    InternalError(String),
    InsufficientBalance(String),
    PaymentError(String),
}

impl std::fmt::Display for IrisError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            IrisError::Unauthorized(msg) => write!(f, "Unauthorized: {}", msg),
            IrisError::NotFound(msg) => write!(f, "Not found: {}", msg),
            IrisError::InvalidInput(msg) => write!(f, "Invalid input: {}", msg),
            IrisError::BitcoinError(msg) => write!(f, "Bitcoin error: {}", msg),
            IrisError::InternalError(msg) => write!(f, "Internal error: {}", msg),
            IrisError::InsufficientBalance(msg) => write!(f, "Insufficient balance: {}", msg),
            IrisError::PaymentError(msg) => write!(f, "Payment error: {}", msg),
        }
    }
}

impl From<IrisError> for String {
    fn from(error: IrisError) -> Self {
        error.to_string()
    }
}