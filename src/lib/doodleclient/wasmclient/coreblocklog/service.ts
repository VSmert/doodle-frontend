// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

// (Re-)generated by schema tool
// >>>> DO NOT CHANGE THIS FILE! <<<<
// Change the json schema instead

import * as wasmclient from "../../wasmclient";

const ArgBlockIndex = "n";
const ArgContractHname = "h";
const ArgFromBlock = "f";
const ArgRequestID = "u";
const ArgToBlock = "t";

const ResBlockIndex = "n";
const ResBlockInfo = "i";
const ResEvent = "e";
const ResGoverningAddress = "g";
const ResRequestID = "u";
const ResRequestIndex = "r";
const ResRequestProcessed = "p";
const ResRequestRecord = "d";
const ResStateControllerAddress = "s";

///////////////////////////// controlAddresses /////////////////////////////

export class ControlAddressesView extends wasmclient.ClientView {
    public async call(): Promise<ControlAddressesResults> {
        return new ControlAddressesResults(await this.callView("controlAddresses", null));
    }
}

export class ControlAddressesResults extends wasmclient.ViewResults {
    blockIndex(): wasmclient.Int32 {
        return this.res.getInt32(ResBlockIndex);
    }

    governingAddress(): wasmclient.Address {
        return this.res.getAddress(ResGoverningAddress);
    }

    stateControllerAddress(): wasmclient.Address {
        return this.res.getAddress(ResStateControllerAddress);
    }
}

///////////////////////////// getBlockInfo /////////////////////////////

export class GetBlockInfoView extends wasmclient.ClientView {
    private args: wasmclient.Arguments = new wasmclient.Arguments();

    public blockIndex(v: wasmclient.Int32): void {
        this.args.setInt32(ArgBlockIndex, v);
    }

    public async call(): Promise<GetBlockInfoResults> {
        this.args.mandatory(ArgBlockIndex);
        return new GetBlockInfoResults(await this.callView("getBlockInfo", this.args));
    }
}

export class GetBlockInfoResults extends wasmclient.ViewResults {
    blockInfo(): wasmclient.Bytes {
        return this.res.getBytes(ResBlockInfo);
    }
}

///////////////////////////// getEventsForBlock /////////////////////////////

export class GetEventsForBlockView extends wasmclient.ClientView {
    private args: wasmclient.Arguments = new wasmclient.Arguments();

    public blockIndex(v: wasmclient.Int32): void {
        this.args.setInt32(ArgBlockIndex, v);
    }

    public async call(): Promise<GetEventsForBlockResults> {
        this.args.mandatory(ArgBlockIndex);
        return new GetEventsForBlockResults(await this.callView("getEventsForBlock", this.args));
    }
}

export class GetEventsForBlockResults extends wasmclient.ViewResults {
    event(): wasmclient.Bytes {
        return this.res.getBytes(ResEvent);
    }
}

///////////////////////////// getEventsForContract /////////////////////////////

export class GetEventsForContractView extends wasmclient.ClientView {
    private args: wasmclient.Arguments = new wasmclient.Arguments();

    public contractHname(v: wasmclient.Hname): void {
        this.args.setHname(ArgContractHname, v);
    }

    public fromBlock(v: wasmclient.Int32): void {
        this.args.setInt32(ArgFromBlock, v);
    }

    public toBlock(v: wasmclient.Int32): void {
        this.args.setInt32(ArgToBlock, v);
    }

    public async call(): Promise<GetEventsForContractResults> {
        this.args.mandatory(ArgContractHname);
        return new GetEventsForContractResults(await this.callView("getEventsForContract", this.args));
    }
}

export class GetEventsForContractResults extends wasmclient.ViewResults {
    event(): wasmclient.Bytes {
        return this.res.getBytes(ResEvent);
    }
}

///////////////////////////// getEventsForRequest /////////////////////////////

export class GetEventsForRequestView extends wasmclient.ClientView {
    private args: wasmclient.Arguments = new wasmclient.Arguments();

    public requestID(v: wasmclient.RequestID): void {
        this.args.setRequestID(ArgRequestID, v);
    }

    public async call(): Promise<GetEventsForRequestResults> {
        this.args.mandatory(ArgRequestID);
        return new GetEventsForRequestResults(await this.callView("getEventsForRequest", this.args));
    }
}

export class GetEventsForRequestResults extends wasmclient.ViewResults {
    event(): wasmclient.Bytes {
        return this.res.getBytes(ResEvent);
    }
}

///////////////////////////// getLatestBlockInfo /////////////////////////////

export class GetLatestBlockInfoView extends wasmclient.ClientView {
    public async call(): Promise<GetLatestBlockInfoResults> {
        return new GetLatestBlockInfoResults(await this.callView("getLatestBlockInfo", null));
    }
}

export class GetLatestBlockInfoResults extends wasmclient.ViewResults {
    blockIndex(): wasmclient.Int32 {
        return this.res.getInt32(ResBlockIndex);
    }

    blockInfo(): wasmclient.Bytes {
        return this.res.getBytes(ResBlockInfo);
    }
}

///////////////////////////// getRequestIDsForBlock /////////////////////////////

export class GetRequestIDsForBlockView extends wasmclient.ClientView {
    private args: wasmclient.Arguments = new wasmclient.Arguments();

    public blockIndex(v: wasmclient.Int32): void {
        this.args.setInt32(ArgBlockIndex, v);
    }

    public async call(): Promise<GetRequestIDsForBlockResults> {
        this.args.mandatory(ArgBlockIndex);
        return new GetRequestIDsForBlockResults(await this.callView("getRequestIDsForBlock", this.args));
    }
}

export class GetRequestIDsForBlockResults extends wasmclient.ViewResults {
    requestID(): wasmclient.RequestID {
        return this.res.getRequestID(ResRequestID);
    }
}

///////////////////////////// getRequestReceipt /////////////////////////////

export class GetRequestReceiptView extends wasmclient.ClientView {
    private args: wasmclient.Arguments = new wasmclient.Arguments();

    public requestID(v: wasmclient.RequestID): void {
        this.args.setRequestID(ArgRequestID, v);
    }

    public async call(): Promise<GetRequestReceiptResults> {
        this.args.mandatory(ArgRequestID);
        return new GetRequestReceiptResults(await this.callView("getRequestReceipt", this.args));
    }
}

export class GetRequestReceiptResults extends wasmclient.ViewResults {
    blockIndex(): wasmclient.Int32 {
        return this.res.getInt32(ResBlockIndex);
    }

    requestIndex(): wasmclient.Int16 {
        return this.res.getInt16(ResRequestIndex);
    }

    requestRecord(): wasmclient.Bytes {
        return this.res.getBytes(ResRequestRecord);
    }
}

///////////////////////////// getRequestReceiptsForBlock /////////////////////////////

export class GetRequestReceiptsForBlockView extends wasmclient.ClientView {
    private args: wasmclient.Arguments = new wasmclient.Arguments();

    public blockIndex(v: wasmclient.Int32): void {
        this.args.setInt32(ArgBlockIndex, v);
    }

    public async call(): Promise<GetRequestReceiptsForBlockResults> {
        this.args.mandatory(ArgBlockIndex);
        return new GetRequestReceiptsForBlockResults(await this.callView("getRequestReceiptsForBlock", this.args));
    }
}

export class GetRequestReceiptsForBlockResults extends wasmclient.ViewResults {
    requestRecord(): wasmclient.Bytes {
        return this.res.getBytes(ResRequestRecord);
    }
}

///////////////////////////// isRequestProcessed /////////////////////////////

export class IsRequestProcessedView extends wasmclient.ClientView {
    private args: wasmclient.Arguments = new wasmclient.Arguments();

    public requestID(v: wasmclient.RequestID): void {
        this.args.setRequestID(ArgRequestID, v);
    }

    public async call(): Promise<IsRequestProcessedResults> {
        this.args.mandatory(ArgRequestID);
        return new IsRequestProcessedResults(await this.callView("isRequestProcessed", this.args));
    }
}

export class IsRequestProcessedResults extends wasmclient.ViewResults {
    requestProcessed(): string {
        return this.res.getString(ResRequestProcessed);
    }
}

///////////////////////////// CoreBlockLogService /////////////////////////////

export class CoreBlockLogService extends wasmclient.Service {
    public constructor(cl: wasmclient.ServiceClient) {
        super(cl, 0xf538ef2b, new Map());
    }

    public controlAddresses(): ControlAddressesView {
        return new ControlAddressesView(this);
    }

    public getBlockInfo(): GetBlockInfoView {
        return new GetBlockInfoView(this);
    }

    public getEventsForBlock(): GetEventsForBlockView {
        return new GetEventsForBlockView(this);
    }

    public getEventsForContract(): GetEventsForContractView {
        return new GetEventsForContractView(this);
    }

    public getEventsForRequest(): GetEventsForRequestView {
        return new GetEventsForRequestView(this);
    }

    public getLatestBlockInfo(): GetLatestBlockInfoView {
        return new GetLatestBlockInfoView(this);
    }

    public getRequestIDsForBlock(): GetRequestIDsForBlockView {
        return new GetRequestIDsForBlockView(this);
    }

    public getRequestReceipt(): GetRequestReceiptView {
        return new GetRequestReceiptView(this);
    }

    public getRequestReceiptsForBlock(): GetRequestReceiptsForBlockView {
        return new GetRequestReceiptsForBlockView(this);
    }

    public isRequestProcessed(): IsRequestProcessedView {
        return new IsRequestProcessedView(this);
    }
}
