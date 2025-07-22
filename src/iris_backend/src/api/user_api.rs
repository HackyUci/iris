use candid::candid_method;
use ic_cdk::api::time;
use ic_cdk_macros::{query, update};
use crate::models::*;
use crate::storage::*;
use crate::api::{get_caller_principal, get_user_role};

#[update]
#[candid_method(update)]
pub fn register_user(request: RegisterUserRequest) -> Result<UserProfile, String> {
    let principal = get_caller_principal()?;
    let current_time = time();
    let principal_string = principal.to_string();
    
    let existing_user = USER_PROFILES.with(|profiles| {
        profiles.borrow().get(&principal_string).cloned()
    });
    
    if existing_user.is_some() {
        return Err("User already registered".to_string());
    }
    
    let user_profile = UserProfile {
        user_principal: principal,
        role: request.role,
        created_at: current_time,
    };
    
    USER_PROFILES.with(|profiles| {
        profiles.borrow_mut().insert(principal_string, user_profile.clone());
    });
    
    Ok(user_profile)
}

#[query]
#[candid_method(query)]
pub fn get_user_profile() -> Result<UserProfile, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    USER_PROFILES.with(|profiles| {
        profiles.borrow().get(&principal_string).cloned()
    }).ok_or("User not found. Please register first.".to_string())
}

#[query]
#[candid_method(query)]
pub fn whoami() -> String {
    ic_cdk::caller().to_string()
}

#[query]
#[candid_method(query)]
pub fn greet(name: String) -> String {
    format!("Hello, {}! Welcome to Iris Bitcoin Payment System.", name)
}