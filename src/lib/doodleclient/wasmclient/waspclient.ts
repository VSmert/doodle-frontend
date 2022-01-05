// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import * as wasmclient from './index';
import { Buffer } from './buffer';
import { IResponse } from './api_common/response_models';
import * as requestSender from './api_common/request_sender';

interface ICallViewResponse extends IResponse {
    Items: [{ Key: string; Value: string }];
}

interface IOffLedgerRequest {
    Request: string;
}

export class WaspClient {
    private waspAPI: string;

    constructor(waspAPI: string) {
        if (waspAPI.startsWith('https://') || waspAPI.startsWith('http://')) this.waspAPI = waspAPI;
        else this.waspAPI = 'http://' + waspAPI;
    }

    public async callView(
        chainID: string,
        contractHName: string,
        entryPoint: string,
        args: Buffer
    ): Promise<wasmclient.Results> {
        const request = { Request: args.toString('base64') };
        const result = await requestSender.sendRequestExt<unknown, ICallViewResponse>(
            this.waspAPI,
            'post',
            `/chain/${chainID}/contract/${contractHName}/callview/${entryPoint}`,
            request
        );
        const res = new wasmclient.Results();

        if (result?.body !== null && result.body.Items) {
            for (const item of result.body.Items) {
                const key = Buffer.from(item.Key, 'base64').toString();
                const value = Buffer.from(item.Value, 'base64');
                res.res.set(key, value);
            }
        }
        return res;
    }

    public async postRequest(chainID: string, offLedgerRequest: Buffer): Promise<void> {
        const request = { Request: offLedgerRequest.toString('base64') };
        await requestSender.sendRequestExt<IOffLedgerRequest, null>(
            this.waspAPI,
            'post',
            `/request/${chainID}`,
            request
        );
    }

    public async waitRequest(chainID: string, reqID: wasmclient.RequestID): Promise<void> {
        await requestSender.sendRequestExt<unknown, null>(
            this.waspAPI,
            'get',
            `/chain/${chainID}/request/${reqID}/wait`
        );
    }
}
