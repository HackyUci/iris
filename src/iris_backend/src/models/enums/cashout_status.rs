use candid::{CandidType, Deserialize};
use serde::Serialize;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum CashoutStatus {
    Pending,
    Processing,
    Completed,
    Failed,
}