use candid::{CandidType, Deserialize};
use serde::Serialize;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct QRCodeData {
    pub bitcoin_address: String,
    pub invoice_id: String,
    pub qr_code_svg: String,
    pub bitcoin_uri: String,
    pub amount_satoshi: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct QRCodeRequest {
    pub address: String,
    pub amount_satoshi: u64,
    pub label: String,
    pub message: Option<String>,
}

impl QRCodeRequest {
    pub fn new(address: String, amount_satoshi: u64, label: String) -> Self {
        Self {
            address,
            amount_satoshi,
            label,
            message: None,
        }
    }
    
    pub fn with_label(mut self, label: String) -> Self {
        self.label = label;
        self
    }
    
    pub fn with_message(mut self, message: String) -> Self {
        self.message = Some(message);
        self
    }
}