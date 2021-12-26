import * as client from './wasmlib/client';
import { Base58, IKeyPair, OffLedgerArgument, WalletService } from './wasp_client';
import * as events from './events';
import { Buffer } from './wasmlib/client/buffer';

const ArgPotNumber = 'potNumber';
const ArgTableNumber = 'tableNumber';
const ArgTableSeatNumber = 'tableSeatNumber';

const ResAgentId = 'agentId';
const ResBigBlindInSeatNumber = 'bigBlindInSeatNumber';
const ResChipCount = 'chipCount';
const ResHandInProgress = 'handInProgress';
const ResIsInHand = 'isInHand';
const ResJoiningNextBigBlind = 'joiningNextBigBlind';
const ResJoiningNextHand = 'joiningNextHand';
const ResPotSize = 'potSize';
const ResPotsCount = 'potsCount';
const ResSize = 'size';
const ResSmallBlindInSeatNumber = 'smallBlindInSeatNumber';
const ResTableCount = 'tableCount';

///////////////////////////// init /////////////////////////////

export class InitFunc extends client.FuncObject {
    public async post(): Promise<void> {
        //this.svc.postRequest('init', null);
    }
}

///////////////////////////// joinNextBigBlind /////////////////////////////

export class JoinNextBigBlindFunc extends client.FuncObject {
    args: client.Arguments = new client.Arguments();

    tableNumber(v: client.Uint32): void {
        this.args.setUint32(ArgTableNumber, v);
    }

    tableSeatNumber(v: client.Uint16): void {
        this.args.setUint16(ArgTableSeatNumber, v);
    }

    public async post(privateKey: Buffer, publicKey: Buffer, address: string): Promise<void> {
        this.args.mandatory(ArgTableNumber);
        this.args.mandatory(ArgTableSeatNumber);
        const keypair : IKeyPair = {
            secretKey: privateKey,
            publicKey: publicKey
        };
        const args : OffLedgerArgument[] = [];
        this.svc.postRequest('joinNextBigBlind', BigInt(200n), keypair, address, args, false);
    }
}

///////////////////////////// joinNextHand /////////////////////////////

export class JoinNextHandFunc extends client.FuncObject {
    args: client.Arguments = new client.Arguments();

    tableNumber(v: client.Uint32): void {
        this.args.setUint32(ArgTableNumber, v);
    }

    tableSeatNumber(v: client.Uint16): void {
        this.args.setUint16(ArgTableSeatNumber, v);
    }

    public async post(privateKey: Buffer, publicKey: Buffer, address: string): Promise<void> {
        this.args.mandatory(ArgTableNumber);
        this.args.mandatory(ArgTableSeatNumber);
        const keypair : IKeyPair = {
            secretKey: privateKey,
            publicKey: publicKey
        };
        const args : OffLedgerArgument[] = [];
        // TODO: Send correct args
        // const offLedgerArgs : OffLedgerArgument[] = [{key: ArgTableNumber, value: this.args.args.get(ArgTableNumber)},
        //     {key: ArgTableSeatNumber, value: this.args.args.get(ArgTableSeatNumber)}];
        await this.svc.postRequest('joinNextHand', BigInt(200n), keypair, address, args, false);
    }
}

///////////////////////////// leaveTable /////////////////////////////

export class LeaveTableFunc extends client.FuncObject {
    args: client.Arguments = new client.Arguments();

    tableNumber(v: client.Uint32): void {
        this.args.setUint32(ArgTableNumber, v);
    }

    public async post(): Promise<void> {
        this.args.mandatory(ArgTableNumber);
        //this.svc.postRequest('leaveTable', this.args);
    }
}

///////////////////////////// getPotInfo /////////////////////////////

export class GetPotInfoView extends client.FuncObject {
    args: client.Arguments = new client.Arguments();

    potNumber(v: client.Uint16): void {
        this.args.setUint16(ArgPotNumber, v);
    }

    tableNumber(v: client.Uint32): void {
        this.args.setUint32(ArgTableNumber, v);
    }

    public async call(): Promise<GetPotInfoResults> {
        this.args.mandatory(ArgPotNumber);
        this.args.mandatory(ArgTableNumber);
        return new GetPotInfoResults(await this.svc.callView('getPotInfo', this.args));
    }
}

export class GetPotInfoResults extends client.ViewResults {
    potSize(): client.Uint64 {
        return this.res.getUint64(ResPotSize);
    }
}

///////////////////////////// getTableCount /////////////////////////////

export class GetTableCountView extends client.FuncObject {
    public async call(): Promise<GetTableCountResults> {
        return new GetTableCountResults(await this.svc.callView('getTableCount', null));
    }
}

export class GetTableCountResults extends client.ViewResults {
    tableCount(): client.Uint32 {
        return this.res.getUint32(ResTableCount);
    }
}

///////////////////////////// getTableInfo /////////////////////////////

export class GetTableInfoView extends client.FuncObject {
    args: client.Arguments = new client.Arguments();

    tableNumber(v: client.Uint32): void {
        this.args.setUint32(ArgTableNumber, v);
    }

    public async call(): Promise<GetTableInfoResults> {
        this.args.mandatory(ArgTableNumber);
        return new GetTableInfoResults(await this.svc.callView('getTableInfo', this.args));
    }
}

export class GetTableInfoResults extends client.ViewResults {
    bigBlindInSeatNumber(): client.Uint16 {
        return this.res.getUint16(ResBigBlindInSeatNumber);
    }

    handInProgress(): boolean {
        return this.res.getBool(ResHandInProgress);
    }

    potsCount(): client.Uint16 {
        return this.res.getUint16(ResPotsCount);
    }

    size(): client.Uint16 {
        return this.res.getUint16(ResSize);
    }

    smallBlindInSeatNumber(): client.Uint16 {
        return this.res.getUint16(ResSmallBlindInSeatNumber);
    }
}

///////////////////////////// getTableSeat /////////////////////////////

export class GetTableSeatView extends client.FuncObject {
    args: client.Arguments = new client.Arguments();

    tableNumber(v: client.Uint32): void {
        this.args.setUint32(ArgTableNumber, v);
    }

    tableSeatNumber(v: client.Uint16): void {
        this.args.setUint16(ArgTableSeatNumber, v);
    }

    public async call(): Promise<GetTableSeatResults> {
        this.args.mandatory(ArgTableNumber);
        this.args.mandatory(ArgTableSeatNumber);
        return new GetTableSeatResults(await this.svc.callView('getTableSeat', this.args));
    }
}

export class GetTableSeatResults extends client.ViewResults {
    agentId(): client.AgentID {
        return this.res.getAgentID(ResAgentId);
    }

    chipCount(): client.Uint64 {
        return this.res.getUint64(ResChipCount);
    }

    isInHand(): boolean {
        return this.res.getBool(ResIsInHand);
    }

    joiningNextBigBlind(): boolean {
        return this.res.getBool(ResJoiningNextBigBlind);
    }

    joiningNextHand(): boolean {
        return this.res.getBool(ResJoiningNextHand);
    }
}

///////////////////////////// DoodleService /////////////////////////////

export class DoodleService extends client.Service {
    constructor(cl: client.ServiceClient, walletService: WalletService, chainID: string) {
        super(cl, walletService, chainID, 0xb40a047a, events.eventHandlers);
    }

    public init(): InitFunc {
        return new InitFunc(this);
    }

    public joinNextBigBlind(): JoinNextBigBlindFunc {
        return new JoinNextBigBlindFunc(this);
    }

    public joinNextHand(): JoinNextHandFunc {
        return new JoinNextHandFunc(this);
    }

    public leaveTable(): LeaveTableFunc {
        return new LeaveTableFunc(this);
    }

    public getPotInfo(): GetPotInfoView {
        return new GetPotInfoView(this);
    }

    public getTableCount(): GetTableCountView {
        return new GetTableCountView(this);
    }

    public getTableInfo(): GetTableInfoView {
        return new GetTableInfoView(this);
    }

    public getTableSeat(): GetTableSeatView {
        return new GetTableSeatView(this);
    }
}
