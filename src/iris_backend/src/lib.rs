mod models;
mod services;

use candid::{candid_method, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::{init, query, update};
use std::cell::RefCell;
use std::collections::HashMap;
use models::*;
use services::*;

thread_local! {
    static INVOICES: RefCell<HashMap<String, Invoice>> = RefCell::new(HashMap::new());
    static INVOICE_COUNTER: RefCell<u64> = RefCell::new(0);
    static MERCHANT_PROFILES: RefCell<HashMap<String, MerchantProfile>> = RefCell::new(HashMap::new());
    static MERCHANT_BALANCES: RefCell<HashMap<String, MerchantBalance>> = RefCell::new(HashMap::new());
    static CASHOUT_REQUESTS: RefCell<HashMap<String, CashoutRequest>> = RefCell::new(HashMap::new());
    static CASHOUT_COUNTER: RefCell<u64> = RefCell::new(0);
    static USER_PROFILES: RefCell<HashMap<String, UserProfile>> = RefCell::new(HashMap::new());
}

#[derive(candid::CandidType, candid::Deserialize, serde::Serialize, Clone, Debug)]
pub struct MerchantProfile {
    pub merchant_principal: Principal,  
    pub business_name: String,
    pub created_at: u64,
    pub total_invoices: u64,
}

#[derive(candid::CandidType, candid::Deserialize, serde::Serialize, Clone, Debug)]
pub struct MerchantBalance {
    pub merchant_principal: Principal,
    pub total_satoshi: u64,
    pub pending_satoshi: u64,
    pub confirmed_satoshi: u64,
    pub preferred_currency: Currency,
    pub last_updated: u64,
}

#[derive(candid::CandidType, candid::Deserialize, serde::Serialize, Clone, Debug)]
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

#[derive(candid::CandidType, candid::Deserialize, serde::Serialize, Clone, Debug)]
pub enum CashoutStatus {
    Pending,
    Processing,
    Completed,
    Failed,
}

#[derive(candid::CandidType, candid::Deserialize)]
pub struct CreateCashoutRequest {
    pub amount_satoshi: u64,
    pub target_currency: Currency,
    pub bank_details: Option<String>,
}

#[derive(candid::CandidType, candid::Deserialize)]
pub struct CreateMerchantRequest {
    pub business_name: String,
}

#[init]
fn init() {
    ic_cdk::println!("Iris Backend initialized");
}

fn get_caller_principal() -> Result<Principal, String> { 
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        Err("Anonymous caller not allowed".to_string())
    } else {
        Ok(caller)
    }
}

#[update]
#[candid_method(update)]
async fn register_merchant(request: CreateMerchantRequest) -> Result<MerchantProfile, String> {
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
    
    let merchant_profile = MerchantProfile {
        merchant_principal: principal,
        business_name: request.business_name,
        created_at: current_time,
        total_invoices: 0,
    };
    
    MERCHANT_PROFILES.with(|profiles| {
        profiles.borrow_mut().insert(principal_string, merchant_profile.clone());
    });
    
    Ok(merchant_profile)
}


#[query]
#[candid_method(query)]
fn get_merchant_profile() -> Result<MerchantProfile, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    MERCHANT_PROFILES.with(|profiles| {
        profiles.borrow().get(&principal_string).cloned()
    }).ok_or("Merchant not found. Please register first.".to_string())
}

#[update]
#[candid_method(update)]
async fn create_invoice(request: CreateInvoiceRequest) -> Result<Invoice, String> {
    let user_role = get_user_role()?;
    if user_role != UserRole::Merchant {
        return Err("Only merchants can create invoices".to_string());
    }
    
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let _merchant = MERCHANT_PROFILES.with(|profiles| {
        profiles.borrow().get(&principal_string).cloned()
    }).ok_or("Merchant not registered. Please register first.")?;
    
    let invoice_id = INVOICE_COUNTER.with(|counter| {
        let mut c = counter.borrow_mut();
        *c += 1;
        InvoiceService::generate_invoice_id(*c)
    });
    
    let invoice_request = CreateInvoiceRequest {
        merchant_id: principal_string.clone(),
        fiat_amount: request.fiat_amount,
        currency: request.currency,
        description: request.description,
    };
    
    let invoice = InvoiceService::create_invoice(invoice_request, invoice_id.clone()).await?;
    
    INVOICES.with(|invoices| {
        invoices.borrow_mut().insert(invoice_id.clone(), invoice.clone());
    });
    
    MERCHANT_PROFILES.with(|profiles| {
        let mut profiles_map = profiles.borrow_mut();
        if let Some(merchant) = profiles_map.get_mut(&principal_string) {
            merchant.total_invoices += 1;
        }
    });
    
    Ok(invoice)
}

#[update]
#[candid_method(update)]
async fn generate_qr_code(invoice_id: String) -> Result<QRCodeData, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
    if invoice.merchant_id != principal_string {
        return Err("Unauthorized: Invoice does not belong to you".to_string());
    }
    
    let qr_request = QRCodeRequest::new(
        invoice.bitcoin_address.clone(),
        invoice.amount_satoshi,
        invoice_id,
    );
    
    let qr_data = QRService::generate_qr_code(qr_request);
    
    Ok(qr_data)
}

#[update]
#[candid_method(update)]
async fn check_payment(invoice_id: String) -> Result<PaymentStatus, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let mut invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
    if invoice.merchant_id != principal_string {
        return Err("Unauthorized: Invoice does not belong to you".to_string());
    }
    
    let old_status = invoice.status.clone();
    let new_status = InvoiceService::check_invoice_payment(&mut invoice).await?;
    
    INVOICES.with(|invoices| {
        invoices.borrow_mut().insert(invoice_id.clone(), invoice.clone());
    });
    
    if old_status != new_status {
        update_merchant_balance(invoice_id).await?;
    }
    
    Ok(new_status)
}

#[query]
#[candid_method(query)]
fn get_invoice(invoice_id: String) -> Result<Invoice, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found".to_string())?;
    
    if invoice.merchant_id != principal_string {
        return Err("Unauthorized: Invoice does not belong to you".to_string());
    }
    
    Ok(invoice)
}

#[query]
#[candid_method(query)]
fn get_my_invoices() -> Result<Vec<Invoice>, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let invoices = INVOICES.with(|invoices| {
        let all_invoices: Vec<Invoice> = invoices.borrow().values().cloned().collect();
        InvoiceService::filter_merchant_invoices(&all_invoices, &principal_string)
    });
    
    Ok(invoices)
}

#[update]
#[candid_method(update)]
async fn update_merchant_balance(invoice_id: String) -> Result<(), String> {
    let invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
    let merchant_principal = Principal::from_text(&invoice.merchant_id)
        .map_err(|_| "Invalid merchant principal")?;
    
    MERCHANT_BALANCES.with(|balances| {
        let mut balances_map = balances.borrow_mut();
        let current_time = time();
        
        let balance = balances_map.entry(invoice.merchant_id.clone()).or_insert(MerchantBalance {
            merchant_principal,
            total_satoshi: 0,
            pending_satoshi: 0,
            confirmed_satoshi: 0,
            preferred_currency: Currency::USD,
            last_updated: current_time,
        });
        
        match invoice.status {
            PaymentStatus::Confirmed => {
                balance.pending_satoshi += invoice.amount_satoshi;
            },
            PaymentStatus::Completed => {
                balance.confirmed_satoshi += invoice.amount_satoshi;
                balance.total_satoshi += invoice.amount_satoshi;
            },
            _ => {}
        }
        
        balance.last_updated = current_time;
    });
    
    Ok(())
}

#[query]
#[candid_method(query)]
fn get_merchant_balance() -> Result<MerchantBalance, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    MERCHANT_BALANCES.with(|balances| {
        balances.borrow().get(&principal_string).cloned()
    }).ok_or("No balance found".to_string())
}

#[update]
#[candid_method(update)]
async fn get_bitcoin_balance(address: String) -> Result<u64, String> {
    BitcoinService::get_bitcoin_balance(&address).await
}

#[update]
#[candid_method(update)]
async fn get_bitcoin_utxos(address: String) -> Result<Vec<BitcoinUtxo>, String> {
    BitcoinService::get_bitcoin_utxos(&address).await
}

#[update]
#[candid_method(update)]
async fn create_cashout_request(request: CreateCashoutRequest) -> Result<CashoutRequest, String> {
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
fn get_my_cashout_requests() -> Result<Vec<CashoutRequest>, String> {
    let principal = get_caller_principal()?;
    
    let requests = CASHOUT_REQUESTS.with(|requests| {
        requests.borrow().values()
            .filter(|r| r.merchant_principal == principal)
            .cloned()
            .collect()
    });
    
    Ok(requests)
}

#[update]
#[candid_method(update)]
async fn simulate_payment(invoice_id: String) -> Result<PaymentStatus, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let mut invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
    if invoice.merchant_id != principal_string {
        return Err("Unauthorized: Invoice does not belong to you".to_string());
    }
    
    let current_time = time();
    invoice.update_status(PaymentStatus::Completed, current_time)?;
    
    INVOICES.with(|invoices| {
        invoices.borrow_mut().insert(invoice_id.clone(), invoice.clone());
    });
    
    update_merchant_balance(invoice_id).await?;
    
    Ok(PaymentStatus::Completed)
}

#[update]
#[candid_method(update)]
async fn simulate_payment_confirmed(invoice_id: String) -> Result<PaymentStatus, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    let mut invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id).cloned()
    }).ok_or("Invoice not found")?;
    
    if invoice.merchant_id != principal_string {
        return Err("Unauthorized: Invoice does not belong to you".to_string());
    }
    
    let current_time = time();
    invoice.update_status(PaymentStatus::Confirmed, current_time)?;
    
    INVOICES.with(|invoices| {
        invoices.borrow_mut().insert(invoice_id.clone(), invoice.clone());
    });
    
    update_merchant_balance(invoice_id).await?;
    
    Ok(PaymentStatus::Confirmed)
}

#[update]
#[candid_method(update)]
fn register_user(request: RegisterUserRequest) -> Result<UserProfile, String> {
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
fn get_user_profile() -> Result<UserProfile, String> {
    let principal = get_caller_principal()?;
    let principal_string = principal.to_string();
    
    USER_PROFILES.with(|profiles| {
        profiles.borrow().get(&principal_string).cloned()
    }).ok_or("User not found. Please register first.".to_string())
}

fn get_user_role() -> Result<UserRole, String> {
    let user = get_user_profile()?;
    Ok(user.role)
}

#[query]
#[candid_method(query)]
fn greet(name: String) -> String {
    format!("Hello, {}! Welcome to Iris Bitcoin Payment System.", name)
}

#[query]
#[candid_method(query)]
fn whoami() -> String {
    ic_cdk::caller().to_string()
}

candid::export_service!();

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}