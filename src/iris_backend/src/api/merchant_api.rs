use candid::candid_method;
use ic_cdk::api::time;
use ic_cdk_macros::{query, update};
use crate::models::*;
use crate::services::*;
use crate::storage::*;
use crate::api::{get_caller_principal, get_user_role};

#[update]
#[candid_method(update)]
pub async fn register_merchant(request: CreateMerchantRequest) -> Result<MerchantProfile, String> {
    let user_role = get_user_role()?;
    if user_role != UserRole::Merchant {
        return Err("Only users with merchant role can register as merchant".to_string());
    }
    
    let principal = get_caller_principal()?;
    let current_time = time();
    let principal_string = principal.to_string();
    
    let existing_merchant = MERCHANT_PROFILES.with(|profiles| {
        profiles.borrow().get(&principal_string).cloned()
    });
    
    if existing_merchant.is_some() {
        return Err("Merchant already registered".to_string());
    }
    
    let static_address = BitcoinService::generate_static_address(&principal);
    
    let merchant_profile = MerchantProfile {
        merchant_principal: principal,
        business_name: request.business_name,
        created_at: current_time,
        total_invoices: 0,
        static_bitcoin_address: static_address,
    };
    
    MERCHANT_PROFILES.with(|profiles| {
        profiles.borrow_mut().insert(principal_string, merchant_profile.clone());
    });
    
    Ok(merchant_profile)
}

#[query]
#[candid_method(query)]
pub fn get_merchant_profile() -> Result<MerchantProfile, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    MERCHANT_PROFILES.with(|profiles| {
        profiles.borrow().get(&principal_string).cloned()
    }).ok_or("Merchant not found. Please register first.".to_string())
}

#[query]
#[candid_method(query)]
pub fn get_merchant_static_qr() -> Result<QRCodeData, String> {
    let user_role = get_user_role()?;
    if user_role != UserRole::Merchant {
        return Err("Only merchants can get static QR".to_string());
    }
    
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let merchant = MERCHANT_PROFILES.with(|profiles| {
        profiles.borrow().get(&principal_string).cloned()
    }).ok_or("Merchant not registered")?;
    
    let qr_request = QRCodeRequest::new(
        merchant.static_bitcoin_address.clone(),
        0,
        format!("STATIC-{}", principal_string),
    ).with_label(merchant.business_name);
    
    let qr_data = QRService::generate_qr_code(qr_request);
    Ok(qr_data)
}

#[query]
#[candid_method(query)]
pub fn get_merchant_balance() -> Result<MerchantBalance, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    MERCHANT_BALANCES.with(|balances| {
        balances.borrow().get(&principal_string).cloned()
    }).ok_or("No balance found".to_string())
}

#[query]
#[candid_method(query)]
pub fn get_merchant_dashboard() -> Result<MerchantDashboard, String> {
    let user_role = get_user_role()?;
    if user_role != UserRole::Merchant {
        return Err("Only merchants can access dashboard".to_string());
    }
    
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let merchant = MERCHANT_PROFILES.with(|profiles| {
        profiles.borrow().get(&principal_string).cloned()
    }).ok_or("Merchant not registered")?;
    
    let balance = MERCHANT_BALANCES.with(|balances| {
        balances.borrow().get(&principal_string).cloned()
    }).unwrap_or(MerchantBalance {
        merchant_principal: principal,
        total_satoshi: 0,
        pending_satoshi: 0,
        confirmed_satoshi: 0,
        preferred_currency: Currency::USD,
        last_updated: 0,
    });
    
    let invoices = INVOICES.with(|invoices| {
        let all_invoices: Vec<Invoice> = invoices.borrow().values().cloned().collect();
        InvoiceService::filter_merchant_invoices(&all_invoices, &principal_string)
    });
    
    let pending_payments = invoices.iter().filter(|i| matches!(i.status, PaymentStatus::Pending | PaymentStatus::Confirmed)).count() as u64;
    let completed_payments = invoices.iter().filter(|i| matches!(i.status, PaymentStatus::Completed)).count() as u64;
    
    let total_balance_fiat = ExchangeService::satoshi_to_fiat(balance.total_satoshi, &balance.preferred_currency);
    
    Ok(MerchantDashboard {
        total_invoices: merchant.total_invoices,
        pending_payments,
        completed_payments,
        total_balance_satoshi: balance.total_satoshi,
        total_balance_fiat,
        preferred_currency: balance.preferred_currency,
    })
}

#[update]
#[candid_method(update)]
pub async fn set_preferred_currency(currency: Currency) -> Result<(), String> {
    let user_role = get_user_role()?;
    if user_role != UserRole::Merchant {
        return Err("Only merchants can set preferred currency".to_string());
    }
    
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    MERCHANT_BALANCES.with(|balances| {
        let mut balances_map = balances.borrow_mut();
        if let Some(balance) = balances_map.get_mut(&principal_string) {
            balance.preferred_currency = currency;
            balance.last_updated = time();
        }
    });
    
    Ok(())
}

#[update]
#[candid_method(update)]
pub async fn create_cashout_request(request: CreateCashoutRequest) -> Result<CashoutRequest, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let balance = MERCHANT_BALANCES.with(|balances| {
        balances.borrow().get(&principal_string).cloned()
    }).ok_or("No balance found")?;
    
    if balance.confirmed_satoshi < request.amount_satoshi {
        return Err("Insufficient confirmed balance".to_string());
    }
    
    let cashout_id = CASHOUT_COUNTER.with(|counter| {
        let mut c = counter.borrow_mut();
        *c += 1;
        format!("CASH-{:06}", *c)
    });
    
    let fiat_amount = ExchangeService::satoshi_to_fiat(request.amount_satoshi, &request.target_currency);
    let current_time = time();
    
    let cashout = CashoutRequest {
        id: cashout_id.clone(),
        merchant_principal: principal,
        amount_satoshi: request.amount_satoshi,
        target_currency: request.target_currency,
        fiat_amount,
        status: CashoutStatus::Pending,
        created_at: current_time,
        bank_details: request.bank_details,
    };
    
    CASHOUT_REQUESTS.with(|requests| {
        requests.borrow_mut().insert(cashout_id, cashout.clone());
    });
    
    MERCHANT_BALANCES.with(|balances| {
        let mut balances_map = balances.borrow_mut();
        if let Some(balance) = balances_map.get_mut(&principal_string) {
            balance.confirmed_satoshi -= request.amount_satoshi;
            balance.total_satoshi -= request.amount_satoshi;
        }
    });
    
    Ok(cashout)
}

#[query]
#[candid_method(query)]
pub fn get_my_cashout_requests() -> Result<Vec<CashoutRequest>, String> {
    let principal = get_caller_principal()?;
    
    let requests = CASHOUT_REQUESTS.with(|requests| {
        requests.borrow().values()
            .filter(|r| r.merchant_principal == principal)
            .cloned()
            .collect()
    });
    
    Ok(requests)
}