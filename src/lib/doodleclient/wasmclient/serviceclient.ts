// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import * as wasmclient from './index';
import { Configuration, IConfiguration } from './configuration';

export class ServiceClient {
    waspClient: wasmclient.WaspClient;
    goShimmerClient: wasmclient.GoShimmerClient;
    configuration: Configuration;

    constructor(configuration: Configuration) {
        this.configuration = configuration;
        this.waspClient = new wasmclient.WaspClient(configuration.waspApiUrl);
        this.goShimmerClient = new wasmclient.GoShimmerClient(configuration);
    }

    static default(): ServiceClient {
        //TODO use TCP instead of websocket for event listener?
        const defaultConfiguration: IConfiguration = {
            seed: null,
            waspWebSocketUrl: 'ws://127.0.0.1:9090',
            waspApiUrl: '127.0.0.1:9090',
            goShimmerApiUrl: '',
        };
        return new ServiceClient(new Configuration(defaultConfiguration)); // "127.0.0.1:5550");
    }
}
