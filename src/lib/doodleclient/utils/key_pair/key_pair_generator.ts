import { Buffer } from '../../wasmclient/buffer';
import { Base58 } from '../../wasmclient/crypto/base58';
import { Seed } from '../../wasmclient/crypto/seed';

export function generatePrivateKeyAndAddress(): [
    privateKey: string,
    publicKey: string,
    address: string,
    privateKey: Buffer,
    publicKey: Buffer
] {
    const seedBuffer = Seed.generate();
    const addressIndex = 0;
    const { secretKey, publicKey } = Seed.generateKeyPair(seedBuffer, addressIndex);
    const base58GeneratedAddress = Seed.generateAddress(seedBuffer, addressIndex);
    const base58PrivateKey = Base58.encode(secretKey);
    const base58PuplicKey = Base58.encode(publicKey);
    return [base58PrivateKey, base58PuplicKey, base58GeneratedAddress, secretKey, publicKey];
}
