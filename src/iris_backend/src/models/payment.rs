use candid::{CandidType, Deserialize};
use serde::Serialize;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug, PartialEq)]
pub enum PaymentStatus {
    Pending,
    Confirmed,
    Completed,
    Failed,
}

impl Default for PaymentStatus {
    fn default() -> Self {
        PaymentStatus::Pending
    }
}

impl PaymentStatus {
    pub fn is_final(&self) -> bool {
        matches!(self, PaymentStatus::Completed | PaymentStatus::Failed)
    }
    
    pub fn can_transition_to(&self, new_status: &PaymentStatus) -> bool {
        match (self, new_status) {
            (PaymentStatus::Pending, PaymentStatus::Confirmed) => true,
            (PaymentStatus::Pending, PaymentStatus::Failed) => true,
            (PaymentStatus::Confirmed, PaymentStatus::Completed) => true,
            (PaymentStatus::Confirmed, PaymentStatus::Failed) => true,
            _ => false,
        }
    }
}