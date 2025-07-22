use candid::{CandidType, Deserialize};
use serde::Serialize;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum PaymentMethod {
    VirtualWallet,
    PlugWallet,
    MockUSD,
    ExternalWallet,
}