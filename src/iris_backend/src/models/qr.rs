use candid::{CandidType, Deserialize};
use serde::Serialize;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct QRCodeData {
    pub bitcoin_address: String,
    pub amount_satoshi: u64,
    pub invoice_id: String,
    pub qr_code_svg: String,
    pub bitcoin_uri: String,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct QRCodeRequest {
    pub bitcoin_address: String,
    pub amount_satoshi: u64,
    pub invoice_id: String,
    pub label: Option<String>,
    pub message: Option<String>,
}

impl QRCodeData {
    pub fn new(
        bitcoin_address: String,
        amount_satoshi: u64,
        invoice_id: String,
        qr_code_svg: String,
    ) -> Self {
        let btc_amount = amount_satoshi as f64 / 100_000_000.0;
        let bitcoin_uri = format!("bitcoin:{}?amount={}", bitcoin_address, btc_amount);
        
        Self {
            bitcoin_address,
            amount_satoshi,
            invoice_id,
            qr_code_svg,
            bitcoin_uri,
        }
    }
    
    pub fn amount_btc(&self) -> f64 {
        self.amount_satoshi as f64 / 100_000_000.0
    }
}

impl QRCodeRequest {
    pub fn new(bitcoin_address: String, amount_satoshi: u64, invoice_id: String) -> Self {
        Self {
            bitcoin_address,
            amount_satoshi,
            invoice_id,
            label: None,
            message: None,
        }
    }
    
    pub fn with_label(mut self, label: String) -> Self {
        self.label = Some(label);
        self
    }
    
    pub fn with_message(mut self, message: String) -> Self {
        self.message = Some(message);
        self
    }
    
    pub fn to_bitcoin_uri(&self) -> String {
        let btc_amount = self.amount_satoshi as f64 / 100_000_000.0;
        let mut uri = format!("bitcoin:{}?amount={}", self.bitcoin_address, btc_amount);
        
        if let Some(label) = &self.label {
            uri.push_str(&format!("&label={}", urlencoding::encode(label)));
        }
        
        if let Some(message) = &self.message {
            uri.push_str(&format!("&message={}", urlencoding::encode(message)));
        }
        
        uri
    }
}

fn urlencoding_encode(input: &str) -> String {
    input.chars()
        .map(|c| match c {
            'A'..='Z' | 'a'..='z' | '0'..='9' | '-' | '_' | '.' | '~' => c.to_string(),
            _ => format!("%{:02X}", c as u8),
        })
        .collect()
}