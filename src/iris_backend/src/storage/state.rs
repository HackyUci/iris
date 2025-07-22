use std::cell::RefCell;
use std::collections::HashMap;
use crate::models::{Invoice, UserProfile, MerchantProfile, MerchantBalance, CashoutRequest};

thread_local! {
    pub static INVOICES: RefCell<HashMap<String, Invoice>> = RefCell::new(HashMap::new());
    pub static INVOICE_COUNTER: RefCell<u64> = RefCell::new(0);
    pub static MERCHANT_PROFILES: RefCell<HashMap<String, MerchantProfile>> = RefCell::new(HashMap::new());
    pub static USER_PROFILES: RefCell<HashMap<String, UserProfile>> = RefCell::new(HashMap::new());
    pub static MERCHANT_BALANCES: RefCell<HashMap<String, MerchantBalance>> = RefCell::new(HashMap::new());
    pub static CASHOUT_REQUESTS: RefCell<HashMap<String, CashoutRequest>> = RefCell::new(HashMap::new());
    pub static CASHOUT_COUNTER: RefCell<u64> = RefCell::new(0);
    pub static STATIC_PAYMENTS: RefCell<HashMap<String, Vec<String>>> = RefCell::new(HashMap::new());
}