use candid::{CandidType, Deserialize};
use serde::Serialize;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum Currency {
    USD,
    GBP,
    SGD,
    IDR,
}