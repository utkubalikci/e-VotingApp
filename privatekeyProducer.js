// 12 words mnemonic key to private key

const bip39 = require('bip39');
const hdkey = require('ethereumjs-wallet/hdkey');

// Mnemonic phrase
const mnemonic = "crew asset pepper pause merit meadow luggage ramp blast screen say fresh";

// Mnemonic phrase to seed
const seed = bip39.mnemonicToSeedSync(mnemonic);

// HD Wallet
const hdWallet = hdkey.fromMasterSeed(seed);

// derivation path
const path = "m/44'/60'/0'/0/0";
const wallet = hdWallet.derivePath(path).getWallet();

// Private Key alın
const privateKey = wallet.getPrivateKeyString(); // 0x ile başlayan 64 karakter uzunluğunda bir string

console.log(privateKey);
