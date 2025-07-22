use candid::{CandidType, Deserialize};
use serde::Serialize;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct BitcoinAddress {
    pub address: String,
    pub derivation_path: Vec<Vec<u8>>,
}

impl BitcoinAddress {
    pub fn new(address: String, derivation_path: Vec<Vec<u8>>) -> Self {
        Self {
            address,
            derivation_path,
        }
    }
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct BitcoinUtxo {
    pub outpoint: String,
    pub value: u64,
    pub height: u32,
}