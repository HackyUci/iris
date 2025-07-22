pub const SATOSHI_PER_BTC: u64 = 100_000_000;
pub const MAX_INVOICE_DESCRIPTION_LENGTH: usize = 500;
pub const MAX_BUSINESS_NAME_LENGTH: usize = 100;
pub const MIN_BITCOIN_ADDRESS_LENGTH: usize = 26;
pub const MAX_BITCOIN_ADDRESS_LENGTH: usize = 62;
pub const MAX_FIAT_AMOUNT: f64 = 1_000_000.0;
pub const MAX_BTC_SUPPLY: u64 = 21_000_000;
pub const MIN_CONFIRMATIONS: u32 = 1;
pub const INVOICE_EXPIRY_HOURS: u64 = 24;
pub const MAX_CASHOUT_AMOUNT: u64 = 1000 * SATOSHI_PER_BTC;

pub const DEFAULT_EXCHANGE_RATES: &[(crate::models::Currency, f64)] = &[
    (crate::models::Currency::USD, 95000.0),
    (crate::models::Currency::GBP, 75000.0),
    (crate::models::Currency::SGD, 128000.0),
    (crate::models::Currency::IDR, 1500000000.0),
];

pub const BITCOIN_NETWORK_TESTNET: bool = true;
pub const ECDSA_KEY_NAME: &str = "test_key_1";

pub const ERROR_MESSAGES: &[(&str, &str)] = &[
    ("UNAUTHORIZED", "Anonymous caller not allowed"),
    ("USER_NOT_FOUND", "User not registered. Please register first."),
    ("MERCHANT_NOT_FOUND", "Merchant not found. Please register first."),
    ("INVOICE_NOT_FOUND", "Invoice not found"),
    ("INSUFFICIENT_BALANCE", "Insufficient confirmed balance"),
    ("INVALID_PRINCIPAL", "Invalid merchant principal"),
    ("MERCHANT_ALREADY_REGISTERED", "Merchant already registered"),
    ("USER_ALREADY_REGISTERED", "User already registered"),
];