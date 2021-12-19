import * as client from './wasmlib/client';
import * as app from './doodle';

export const eventHandlers: client.EventHandlers = {
    'doodle.gameEnded': onDoodleGameEndedThunk,
    'doodle.gameStarted': onDoodleGameStartedThunk,
    'doodle.playerJoinsNextBigBlind': onDoodlePlayerJoinsNextBigBlindThunk,
    'doodle.playerJoinsNextHand': onDoodlePlayerJoinsNextHandThunk,
    'doodle.playerLeft': onDoodlePlayerLeftThunk,
    'doodle.playerWinsAllPots': onDoodlePlayerWinsAllPotsThunk,
};

export class EventGameEnded extends client.Event {
    public tableNumber!: client.Uint32;
}

function onDoodleGameEndedThunk(message: string[]) {
    const e = new EventGameEnded(message);
    e.tableNumber = e.nextUint32();
    app.onDoodleGameEnded(e);
}

export class EventGameStarted extends client.Event {
    public paidBigBlindTableSeatNumber!: client.Uint16;
    public paidSmallBlindTableSeatNumber!: client.Uint16;
    public tableNumber!: client.Uint32;
}

function onDoodleGameStartedThunk(message: string[]) {
    const e = new EventGameStarted(message);
    e.paidBigBlindTableSeatNumber = e.nextUint16();
    e.paidSmallBlindTableSeatNumber = e.nextUint16();
    e.tableNumber = e.nextUint32();
    app.onDoodleGameStarted(e);
}

export class EventPlayerJoinsNextBigBlind extends client.Event {
    public playerAgentId!: client.AgentID;
    public playersInitialChipCount!: client.Uint64;
    public tableNumber!: client.Uint32;
    public tableSeatNumber!: client.Uint16;
}

function onDoodlePlayerJoinsNextBigBlindThunk(message: string[]) {
    const e = new EventPlayerJoinsNextBigBlind(message);
    e.playerAgentId = e.nextAgentID();
    e.playersInitialChipCount = e.nextUint64();
    e.tableNumber = e.nextUint32();
    e.tableSeatNumber = e.nextUint16();
    app.onDoodlePlayerJoinsNextBigBlind(e);
}

export class EventPlayerJoinsNextHand extends client.Event {
    public playerAgentId!: client.AgentID;
    public playersInitialChipCount!: client.Uint64;
    public tableNumber!: client.Uint32;
    public tableSeatNumber!: client.Uint16;
}

function onDoodlePlayerJoinsNextHandThunk(message: string[]) {
    const e = new EventPlayerJoinsNextHand(message);
    e.playerAgentId = e.nextAgentID();
    e.playersInitialChipCount = e.nextUint64();
    e.tableNumber = e.nextUint32();
    e.tableSeatNumber = e.nextUint16();
    app.onDoodlePlayerJoinsNextHand(e);
}

export class EventPlayerLeft extends client.Event {
    public tableNumber!: client.Uint32;
    public tableSeatNumber!: client.Uint16;
}

function onDoodlePlayerLeftThunk(message: string[]) {
    const e = new EventPlayerLeft(message);
    e.tableNumber = e.nextUint32();
    e.tableSeatNumber = e.nextUint16();
    app.onDoodlePlayerLeft(e);
}

export class EventPlayerWinsAllPots extends client.Event {
    public tableNumber!: client.Uint32;
    public tableSeatNumber!: client.Uint16;
    public totalPotSize!: client.Uint64;
}

function onDoodlePlayerWinsAllPotsThunk(message: string[]) {
    const e = new EventPlayerWinsAllPots(message);
    e.tableNumber = e.nextUint32();
    e.tableSeatNumber = e.nextUint16();
    e.totalPotSize = e.nextUint64();
    app.onDoodlePlayerWinsAllPots(e);
}
