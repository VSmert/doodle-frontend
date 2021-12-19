import { BasicClientConfiguration, BasicClient } from '../wasp_client';
import { Configuration } from './configuration';

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
