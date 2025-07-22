use candid::{CandidType, Deserialize};
use serde::Serialize;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug, PartialEq)]
pub enum PaymentStatus {
    Pending,
    Confirmed,
    Completed,
    Failed,
}