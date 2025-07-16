use ic_cdk::api::management_canister::bitcoin::{
    bitcoin_get_balance, bitcoin_get_utxos, BitcoinNetwork, GetBalanceRequest, GetUtxosRequest,
};
use ic_cdk::api::management_canister::ecdsa::{
    ecdsa_public_key, EcdsaCurve, EcdsaKeyId, EcdsaPublicKeyArgument,
};
use sha2::{Digest, Sha256};
use crate::models::{BitcoinUtxo, PaymentStatus, BitcoinAddress};

const BITCOIN_NETWORK: BitcoinNetwork = BitcoinNetwork::Testnet;
const ECDSA_KEY_NAME: &str = "test_key_1";

pub struct BitcoinService;

impl BitcoinService {
    pub async fn get_ecdsa_public_key() -> Result<Vec<u8>, String> {
        let key_id = EcdsaKeyId {
            curve: EcdsaCurve::Secp256k1,
            name: ECDSA_KEY_NAME.to_string(),
        };

        let arg = EcdsaPublicKeyArgument {
            canister_id: None,
            derivation_path: vec![],
            key_id: key_id.clone(),
        };

        match ecdsa_public_key(arg).await {
            Ok((response,)) => Ok(response.public_key),
            Err(e) => Err(format!("Failed to get ECDSA public key: {:?}", e)),
        }
    }

    pub fn public_key_to_bitcoin_address(public_key: &[u8]) -> String {
        let mut hasher = Sha256::new();
        hasher.update(public_key);
        let hash = hasher.finalize();
        
        let mut ripemd = ripemd::Ripemd160::new();
        ripemd.update(&hash);
        let ripemd_hash = ripemd.finalize();
        
        let mut version_hash = vec![0x6f];
        version_hash.extend_from_slice(&ripemd_hash);
        
        let mut hasher1 = Sha256::new();
        hasher1.update(&version_hash);
        let checksum1 = hasher1.finalize();
        
        let mut hasher2 = Sha256::new();
        hasher2.update(&checksum1);
        let checksum2 = hasher2.finalize();
        
        version_hash.extend_from_slice(&checksum2[..4]);
        
        bs58::encode(version_hash).into_string()
    }

    pub async fn generate_bitcoin_address() -> Result<BitcoinAddress, String> {
        let public_key = Self::get_ecdsa_public_key().await?;
        let address = Self::public_key_to_bitcoin_address(&public_key);
        Ok(BitcoinAddress::new(address, vec![]))
    }

    pub async fn get_bitcoin_balance(address: &str) -> Result<u64, String> {
        let request = GetBalanceRequest {
            address: address.to_string(),
            network: BITCOIN_NETWORK,
            min_confirmations: Some(1),
        };

        match bitcoin_get_balance(request).await {
            Ok((balance,)) => Ok(balance),
            Err(e) => Err(format!("Failed to get balance: {:?}", e)),
        }
    }

    pub async fn get_bitcoin_utxos(address: &str) -> Result<Vec<BitcoinUtxo>, String> {
        let request = GetUtxosRequest {
            address: address.to_string(),
            network: BITCOIN_NETWORK,
            filter: None,
        };

        match bitcoin_get_utxos(request).await {
            Ok((response,)) => {
                let utxos = response.utxos.iter().map(|utxo| BitcoinUtxo {
                    txid: hex::encode(&utxo.outpoint.txid),
                    vout: utxo.outpoint.vout,
                    value: utxo.value,
                    confirmations: response.tip_height - utxo.height + 1,
                }).collect();
                Ok(utxos)
            }
            Err(e) => Err(format!("Failed to get UTXOs: {:?}", e)),
        }
    }

    pub async fn check_payment_status(address: &str, expected_amount: u64) -> Result<PaymentStatus, String> {
        let balance = Self::get_bitcoin_balance(address).await?;
        
        if balance >= expected_amount {
            let utxos = Self::get_bitcoin_utxos(address).await?;
            let confirmed_utxos: Vec<_> = utxos.iter().filter(|u| u.confirmations >= 1).collect();
            
            if !confirmed_utxos.is_empty() {
                Ok(PaymentStatus::Completed)
            } else {
                Ok(PaymentStatus::Confirmed)
            }
        } else {
            Ok(PaymentStatus::Pending)
        }
    }
}