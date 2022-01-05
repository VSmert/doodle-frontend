import { Configuration } from '../wasmclient/configuration';

export async function GetChainId(configuration: Configuration): Promise<string> {
    const response = await fetch(configuration.waspApiUrl + '/adm/chainrecords');
    const data = await response.json();
    return data[0].ChainID;
}
