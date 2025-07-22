use crate::models::Currency;

pub struct ExchangeService;

impl ExchangeService {
    pub fn get_btc_rate(currency: &Currency) -> f64 {
        match currency {
            Currency::USD => 95000.0,
            Currency::GBP => 75000.0,
            Currency::SGD => 128000.0,
            Currency::IDR => 1500000000.0,
        }
    }
    
    pub fn fiat_to_satoshi(fiat_amount: f64, currency: &Currency) -> u64 {
        let btc_rate = Self::get_btc_rate(currency);
        let btc_amount = fiat_amount / btc_rate;
        (btc_amount * 100_000_000.0) as u64
    }
    
    pub fn satoshi_to_fiat(satoshi: u64, currency: &Currency) -> f64 {
        let btc_amount = satoshi as f64 / 100_000_000.0;
        let btc_rate = Self::get_btc_rate(currency);
        btc_amount * btc_rate
    }
    
    pub fn btc_to_fiat(btc_amount: f64, currency: &Currency) -> f64 {
        let btc_rate = Self::get_btc_rate(currency);
        btc_amount * btc_rate
    }
    
    pub fn fiat_to_btc(fiat_amount: f64, currency: &Currency) -> f64 {
        let btc_rate = Self::get_btc_rate(currency);
        fiat_amount / btc_rate
    }
}