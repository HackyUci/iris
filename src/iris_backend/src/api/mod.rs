pub mod user_api;
pub mod merchant_api;
pub mod invoice_api;
pub mod payment_api;

pub use user_api::*;
pub use merchant_api::*;
pub use invoice_api::*;
pub use payment_api::*;

use candid::Principal;
use crate::models::*;
use crate::storage::*;

pub fn get_caller_principal() -> Result<Principal, String> {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        Err("Anonymous caller not allowed".to_string())
    } else {
        Ok(caller)
    }
}

pub fn get_user_role() -> Result<UserRole, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    USER_PROFILES.with(|profiles| {
        profiles.borrow().get(&principal_string).map(|p| p.role.clone())
    }).ok_or("User not registered. Please register first.".to_string())
}