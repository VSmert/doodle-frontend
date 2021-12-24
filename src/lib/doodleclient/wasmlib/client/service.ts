// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { Buffer, Colors, IOffLedger, OffLedger, BasicClient } from '../../wasp_client';
import * as client from './index';
import configJson from '../../config.dev.json';

export type ServiceClient = BasicClient;

export type EventHandlers = { [key: string]: (message: string[]) => void };
type ParameterResult = { [key: string]: Buffer };

export class FuncObject {
    svc: Service;

    constructor(svc: Service) {
        this.svc = svc;
    }
}

export class ViewResults {
    res: client.Results;

    constructor(res: client.Results) {
        this.res = res;
    }
}

export class Service {
    private client: ServiceClient;
    private eventHandlers: EventHandlers;
    public chainId: string;
    public scHname: client.Hname;

    constructor(client: ServiceClient, chainId: string, scHname: client.Hname, eventHandlers: EventHandlers) {
        this.client = client;
        this.chainId = chainId;
        this.scHname = scHname;
        this.eventHandlers = eventHandlers;
        this.connectWebSocket();
    }

    private connectWebSocket(): void {
        if (this.chainId == '') return;

        const webSocketUrl = configJson.waspWebSocketUrl.replace('%chainId', this.chainId);
        // eslint-disable-next-line no-console
        console.log(`Connecting to Websocket => ${webSocketUrl}`);
        const webSocket = new WebSocket(webSocketUrl);
        webSocket.addEventListener('message', (x) => this.handleIncomingMessage(x));
        webSocket.addEventListener('close', () => setTimeout(this.connectWebSocket.bind(this), 1000));
    }

    private handleIncomingMessage(message: MessageEvent<string>): void {
        // expect vmmsg <chain ID> <contract hname> contract.event|parameters
        const msg = message.data.toString().split(' ');
        if (msg.length != 4 || msg[0] != 'vmmsg') {
            return;
        }
        const topics = msg[3].split('|');
        const topic = topics[0];
        if (this.eventHandlers[topic] != undefined) {
            const eventArg = topics.slice(1);
            this.eventHandlers[topic](eventArg);
        }
    }

    // calls a view
    public async callView(viewName: string, args: client.Arguments | null): Promise<client.Results> {
        const results: client.Results = new client.Results();

        const response = await this.client.callView(this.chainId, this.scHname.toString(16), viewName);
        if (response.Items) {
            for (const item of response.Items) {
                const key = Buffer.from(item.Key, 'base64').toString();
                const value = Buffer.from(item.Value, 'base64');
                results.res.set(key, value);
            }
        }
        return results;
    }

    //posts off-tangle request
    // public async postRequest(funcName: string, args: client.Arguments | null): Promise<void> {
    //     let request: IOffLedger = {
    //         requestType: 1,
    //         noonce: BigInt(performance.now() + performance.timeOrigin * 10000000),
    //         contract: this.scHname,
    //         entrypoint: hFunc,
    //         arguments: [{ key: '-number', value: betNumber }],
    //         balances: [{ balance: take, color: Colors.IOTA_COLOR_BYTES }],
    //     };

    //     request = OffLedger.Sign(request, keyPair);

    //     await this.client.sendOffLedgerRequest(this.chainId, request);
    //     await this.client.sendExecutionRequest(this.chainId, OffLedger.GetRequestId(request));
    // }
}
