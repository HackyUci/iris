use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug, PartialEq)]
pub enum UserRole {
    Customer,
    Merchant,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct UserProfile {
    pub user_principal: Principal,
    pub role: UserRole,
    pub created_at: u64,
}

#[derive(CandidType, Deserialize)]
pub struct RegisterUserRequest {
    pub role: UserRole,
}