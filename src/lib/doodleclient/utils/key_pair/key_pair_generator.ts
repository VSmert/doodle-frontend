import { IKeyPair } from "@/lib/doodleclient/wasmclient/crypto";
import { Base58 } from "@/lib/doodleclient/wasmclient/crypto/base58";
import { Seed } from "@/lib/doodleclient/wasmclient/crypto/seed";

export function generatePrivateKeyAndAddress(): [privateKey: string, publicKey: string, address: string] {
    const seedBuffer = Seed.generate();
    const addressIndex = 0;
    const { secretKey, publicKey } = Seed.generateKeyPair(seedBuffer, addressIndex);
    const base58GeneratedAddress = Seed.generateAddress(seedBuffer, addressIndex);
    const base58PrivateKey = Base58.encode(secretKey);
    const base58PuplicKey = Base58.encode(publicKey);
    return [base58PrivateKey, base58PuplicKey, base58GeneratedAddress];
}

export function getIKeyPair(base58PrivateKey: string, base58PublicKey: string): IKeyPair {
    const keypair: IKeyPair = {
        secretKey: Base58.decode(base58PrivateKey),
        publicKey: Base58.decode(base58PublicKey),
    };
    return keypair;
}
