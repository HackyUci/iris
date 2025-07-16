use candid::{CandidType, Deserialize};
use serde::Serialize;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct BitcoinUtxo {
    pub txid: String,
    pub vout: u32,
    pub value: u64,
    pub confirmations: u32,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct BitcoinAddress {
    pub address: String,
    pub derivation_path: Vec<u8>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct BitcoinTransaction {
    pub txid: String,
    pub block_height: Option<u64>,
    pub confirmations: u32,
    pub amount_satoshi: u64,
    pub fee_satoshi: u64,
    pub timestamp: u64,
}

impl BitcoinUtxo {
    pub fn is_confirmed(&self, min_confirmations: u32) -> bool {
        self.confirmations >= min_confirmations
    }
    
    pub fn value_btc(&self) -> f64 {
        self.value as f64 / 100_000_000.0
    }
}

impl BitcoinAddress {
    pub fn new(address: String, derivation_path: Vec<u8>) -> Self {
        Self {
            address,
            derivation_path,
        }
    }
}

impl BitcoinTransaction {
    pub fn is_confirmed(&self, min_confirmations: u32) -> bool {
        self.confirmations >= min_confirmations
    }
    
    pub fn amount_btc(&self) -> f64 {
        self.amount_satoshi as f64 / 100_000_000.0
    }
}