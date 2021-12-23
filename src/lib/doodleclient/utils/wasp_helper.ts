import { BasicClientConfiguration, BasicClient } from '../wasp_client';
import { Base58 } from '../wasp_client/crypto/base58';
import { Seed as waspClientSeed } from '../wasp_client/crypto/seed';

import { Configuration } from './configuration';

export * as waspClient from '../wasp_client';
export { WalletService, Colors } from '../wasp_client';

export function GetBasicClient(configuration: Configuration): BasicClient {
    const basicClientConfiguration = getBasicClientConfiguration(configuration);
    return new BasicClient(basicClientConfiguration);
}

function getBasicClientConfiguration(configuration: Configuration): BasicClientConfiguration {
    const basicClientConfiguration: BasicClientConfiguration = {
        GoShimmerAPIUrl: configuration.goShimmerApiUrl,
        WaspAPIUrl: configuration.waspApiUrl,
        SeedUnsafe: configuration.seed,
    };
    return basicClientConfiguration;
}

export async function GetChainId(configuration: Configuration): Promise<string> {
    const response = await fetch(configuration.waspApiUrl + '/adm/chainrecords');
    const data = await response.json();
    return data[0].ChainID;
}

export function generatePrivateKeyAndAddress(): [privateKey: string, publicKey: string, address: string] {
    const seedBuffer = waspClientSeed.generate();
    const addressIndex = 0;
    const { secretKey, publicKey } = waspClientSeed.generateKeyPair(seedBuffer, addressIndex);
    const generatedAddress = waspClientSeed.generateAddress(seedBuffer, addressIndex);
    const base58PrivateKey = Base58.encode(secretKey);
    const base58PuplicKey = Base58.encode(publicKey);
    return [base58PrivateKey, base58PuplicKey, generatedAddress];
}
