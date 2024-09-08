import { Keypair } from '@solana/web3.js';
import { HDKey } from 'micro-ed25519-hdkey';
import * as bip39 from 'bip39';

export class CryptoWalletKeysManager {
  private static instance: CryptoWalletKeysManager;

  private hd: HDKey;

  private constructor(mnemonic: string) {
    const seed = bip39.mnemonicToSeedSync(mnemonic, '');
    this.hd = HDKey.fromMasterSeed(seed.toString('hex'));
  }

  public static getInstance(): CryptoWalletKeysManager {
    if (!CryptoWalletKeysManager.instance) {
      const mnemonic = process.env.MNEMONIC;
      if (!mnemonic) throw new Error('Mnemonic not provided');
      CryptoWalletKeysManager.instance = new CryptoWalletKeysManager(mnemonic);
    }
    return CryptoWalletKeysManager.instance;
  }

  public getKeypair(index: number): Keypair {
    const path = `m/44'/501'/${index}'/0'`;
    const keypair = Keypair.fromSeed(this.hd.derive(path).privateKey);
    return keypair;
  }
}
