mod api;
mod models;
mod services;
mod storage;

pub use api::*;
pub use models::*;

use ic_cdk_macros::init;

#[init]
fn init() {
    ic_cdk::println!("Iris Backend initialized");
}

candid::export_service!();

#[ic_cdk_macros::query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}