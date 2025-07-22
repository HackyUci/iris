use crate::models::{QRCodeData, QRCodeRequest};

pub struct QRService;

impl QRService {
    pub fn generate_qr_code(request: QRCodeRequest) -> QRCodeData {
        let mut bitcoin_uri = format!(
            "bitcoin:{}?amount={}",
            request.address,
            request.amount_satoshi as f64 / 100_000_000.0
        );
        
        if !request.label.is_empty() {
            bitcoin_uri.push_str(&format!("&label={}", urlencoding::encode(&request.label)));
        }
        
        if let Some(message) = &request.message {
            bitcoin_uri.push_str(&format!("&message={}", urlencoding::encode(message)));
        }
        
        QRCodeData {
            bitcoin_address: request.address.clone(),
            invoice_id: request.label.clone(),
            qr_code_svg: format!("<svg>QR for {}</svg>", request.address),
            bitcoin_uri,
            amount_satoshi: request.amount_satoshi,
        }
    }
}