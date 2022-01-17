import { IEventHandler } from "@/lib/doodleclient/wasmclient";
import * as events from "@/lib/doodleclient/events";
import { LogTag, Log } from "@/lib/doodleclient/utils/logger";

export class JoinNextHandEvent implements IEventHandler {
    callHandler(topic: string, params: string[]): void {
        const event = new events.EventPlayerJoinsNextHand(params);
        Log(
            LogTag.SmartContract,
            `Event: ${topic} -> Table ${event.tableNumber} Seat ${event.tableSeatNumber} Chip count: ${event.playersInitialChipCount}`
        );
    }
}

export class JoinNextBigBlindEvent implements IEventHandler {
    callHandler(topic: string, params: string[]): void {
        const event = new events.EventPlayerJoinsNextBigBlind(params);
        Log(
            LogTag.SmartContract,
            `Event: ${topic} -> Table ${event.tableNumber} Seat ${event.tableSeatNumber} Chip count: ${event.playersInitialChipCount}`
        );
    }
}

export class PlayerLeftEvent implements IEventHandler {
    callHandler(topic: string, params: string[]): void {
        const event = new events.EventPlayerLeft(params);
        Log(LogTag.SmartContract, `Event: ${topic} -> Table ${event.tableNumber} Seat ${event.tableSeatNumber}`);
    }
}

export class GameEndedEvent implements IEventHandler {
    callHandler(topic: string, params: string[]): void {
        const event = new events.EventGameEnded(params);
        Log(LogTag.SmartContract, `Event: ${topic} -> Table ${event.tableNumber}`);
    }
}

export class GameStartedEvent implements IEventHandler {
    callHandler(topic: string, params: string[]): void {
        const event = new events.EventGameStarted(params);
        Log(
            LogTag.SmartContract,
            `Event: ${topic} -> Table ${event.tableNumber} paidBigBlindTableSeatNumber ${event.paidBigBlindTableSeatNumber} paidSmallBlindTableSeatNumber ${event.paidSmallBlindTableSeatNumber}`
        );
    }
}

export class PlayerWinsAllPotsEvent implements IEventHandler {
    callHandler(topic: string, params: string[]): void {
        const event = new events.EventPlayerWinsAllPots(params);
        Log(
            LogTag.SmartContract,
            `Event: ${topic} -> Table ${event.tableNumber} TableSeatNumber ${event.tableSeatNumber} TotalPotSize ${event.totalPotSize}`
        );
    }
}
