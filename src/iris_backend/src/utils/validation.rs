use crate::utils::errors::IrisError;

pub struct ValidationUtils;

impl ValidationUtils {
    pub fn validate_business_name(name: &str) -> Result<(), IrisError> {
        if name.trim().is_empty() {
            return Err(IrisError::InvalidInput("Business name cannot be empty".to_string()));
        }
        
        if name.len() > 100 {
            return Err(IrisError::InvalidInput("Business name too long (max 100 characters)".to_string()));
        }
        
        Ok(())
    }
    
    pub fn validate_fiat_amount(amount: f64) -> Result<(), IrisError> {
        if amount <= 0.0 {
            return Err(IrisError::InvalidInput("Amount must be positive".to_string()));
        }
        
        if amount > 1_000_000.0 {
            return Err(IrisError::InvalidInput("Amount too large".to_string()));
        }
        
        Ok(())
    }
    
    pub fn validate_bitcoin_address(address: &str) -> Result<(), IrisError> {
        if address.trim().is_empty() {
            return Err(IrisError::InvalidInput("Bitcoin address cannot be empty".to_string()));
        }
        
        if address.len() < 26 || address.len() > 62 {
            return Err(IrisError::InvalidInput("Invalid bitcoin address length".to_string()));
        }
        
        Ok(())
    }
    
    pub fn validate_invoice_description(description: &Option<String>) -> Result<(), IrisError> {
        if let Some(desc) = description {
            if desc.len() > 500 {
                return Err(IrisError::InvalidInput("Description too long (max 500 characters)".to_string()));
            }
        }
        Ok(())
    }
    
    pub fn validate_satoshi_amount(amount: u64) -> Result<(), IrisError> {
        if amount == 0 {
            return Err(IrisError::InvalidInput("Amount cannot be zero".to_string()));
        }
        
        if amount > 21_000_000 * 100_000_000 {
            return Err(IrisError::InvalidInput("Amount exceeds maximum Bitcoin supply".to_string()));
        }
        
        Ok(())
    }
}