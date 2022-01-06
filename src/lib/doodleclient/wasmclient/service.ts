// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import * as wasmclient from "./index";
import { IKeyPair } from "./crypto";
import { IOnLedger } from "./goshimmer/models/on_ledger";
import { Colors } from "./colors";

export type EventHandlers = { [key: string]: (message: string[]) => void };

export class Service {
    private serviceClient: wasmclient.ServiceClient;
    private webSocket: WebSocket | null = null;
    public keyPair: IKeyPair | null = null;
    private eventHandlers: EventHandlers | null = null;
    public scHname: wasmclient.Hname;
    private waspWebSocketUrl: string = "";

    constructor(client: wasmclient.ServiceClient, scHname: wasmclient.Hname, eventHandlers: EventHandlers) {
        this.serviceClient = client;
        this.scHname = scHname;
        this.configureWebSocketsEventHandlers(eventHandlers);
    }

    public async callView(viewName: string, args: wasmclient.Arguments): Promise<wasmclient.Results> {
        return await this.serviceClient.waspClient.callView(
            this.serviceClient.configuration.chainId,
            this.scHname.toString(16),
            viewName,
            args.encode()
        );
    }

    public async postRequest(
        hFuncName: wasmclient.Int32,
        args: wasmclient.Arguments,
        transfer: wasmclient.Transfer,
        keyPair: IKeyPair,
        offLedger: boolean,
        address: string = "",
        contractName: number = this.scHname,
    ): Promise<string> {
        if (offLedger) {
            const requestID = await this.serviceClient.waspClient.postOffLedgerRequest(
                this.serviceClient.configuration.chainId,
                contractName,
                hFuncName,
                args,
                transfer,
                keyPair
            );
            return requestID;
        } else {
            const transactionID = await this.postOnLedgerRequest(address, this.serviceClient.configuration.chainId, args, transfer, keyPair, contractName, hFuncName);
            return transactionID;
        }
    }

    private async postOnLedgerRequest(
        address: string,
        chainId: string,
        args: wasmclient.Arguments,
        transfer: wasmclient.Transfer,
        keyPair: IKeyPair,
        contractName: wasmclient.Int32,
        hFuncName: wasmclient.Int32
    ): Promise<string> {
        const payload : IOnLedger = {
            contract : contractName,
            entrypoint: hFuncName
            //TODO: map args
        }
        const result = await this.serviceClient.goShimmerClient.sendOnLedgerRequest(address, chainId, payload, transfer.get(Colors.IOTA_COLOR), keyPair);
        if (!result.transaction_id) throw new Error("No transaction id");
        return result.transaction_id;
    }

    public async waitRequest(reqID: wasmclient.RequestID): Promise<void> {
        await this.serviceClient.waspClient.waitRequest(this.serviceClient.configuration.chainId, reqID);
    }

    private configureWebSocketsEventHandlers(eventHandlers: EventHandlers) {
        this.eventHandlers = eventHandlers;

        if (
            this.serviceClient.configuration.waspWebSocketUrl.startsWith("wss://") ||
            this.serviceClient.configuration.waspWebSocketUrl.startsWith("ws://")
        )
            this.waspWebSocketUrl = this.serviceClient.configuration.waspWebSocketUrl;
        else this.waspWebSocketUrl = "ws://" + this.serviceClient.configuration.waspWebSocketUrl;

        this.waspWebSocketUrl = this.waspWebSocketUrl.replace("%chainId", this.serviceClient.configuration.chainId);

        this.connectWebSocket();
    }

    private connectWebSocket(): void {
        // eslint-disable-next-line no-console
        console.log(`Connecting to Websocket => ${this.waspWebSocketUrl}`);
        this.webSocket = new WebSocket(this.waspWebSocketUrl);
        this.webSocket.addEventListener("message", (x) => this.handleIncomingMessage(x));
        this.webSocket.addEventListener("close", () => setTimeout(this.connectWebSocket.bind(this), 1000));
    }

    private handleIncomingMessage(message: MessageEvent<string>): void {
        // expect vmmsg <chain ID> <contract hname> contract.event|parameters
        const msg = message.data.toString().split(" ");
        if (msg.length != 4 || msg[0] != "vmmsg") {
            return;
        }
        const topics = msg[3].split("|");
        const topic = topics[0];
        if (this.eventHandlers && this.eventHandlers[topic] != undefined) {
            this.eventHandlers[topic](msg.slice(1));
        }
    }
}
