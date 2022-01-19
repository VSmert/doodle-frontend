import { IEventHandler } from "@/lib/doodleclient/wasmclient";
import * as events from "@/lib/doodleclient/events";
import { LogTag, Log } from "@/lib/doodleclient/utils/logger";

import { IPlayer } from "@/components/models/player";

abstract class TableSpecificEvent implements IEventHandler {
    protected readonly tableNumber: number;

    public constructor(tableNumber: number) {
        this.tableNumber = tableNumber;
    }

    abstract callHandler(topic: string, params: string[]): void;
}

abstract class TableSeatSpecificEvent extends TableSpecificEvent {
    protected readonly tableSeatNumber: number;

    public constructor(player: IPlayer) {
        super(player.tableNumber);
        this.tableSeatNumber = player.tableSeatNumber;
    }

    abstract callHandler(topic: string, params: string[]): void;
}

export class JoinNextHandEvent extends TableSeatSpecificEvent {
    callHandler(topic: string, params: string[]): void {
        const event = new events.EventPlayerJoinsNextHand(params);
        if (event.tableNumber != this.tableNumber || event.tableSeatNumber != this.tableSeatNumber) return;

        Log(
            LogTag.SmartContract,
            `Event: ${topic} -> Table ${event.tableNumber} Seat ${event.tableSeatNumber} Chip count: ${event.playersInitialChipCount}`
        );
    }
}

export class JoinNextBigBlindEvent extends TableSeatSpecificEvent {
    callHandler(topic: string, params: string[]): void {
        const event = new events.EventPlayerJoinsNextBigBlind(params);
        if (event.tableNumber != this.tableNumber || event.tableSeatNumber != this.tableSeatNumber) return;

        Log(
            LogTag.SmartContract,
            `Event: ${topic} -> Table ${event.tableNumber} Seat ${event.tableSeatNumber} Chip count: ${event.playersInitialChipCount}`
        );
    }
}

export class PlayerLeftEvent extends TableSeatSpecificEvent {
    callHandler(topic: string, params: string[]): void {
        const event = new events.EventPlayerLeft(params);
        if (event.tableNumber != this.tableNumber || event.tableSeatNumber != this.tableSeatNumber) return;

        Log(LogTag.SmartContract, `Event: ${topic} -> Table ${event.tableNumber} Seat ${event.tableSeatNumber}`);
    }
}

export class PlayerWinsAllPotsEvent extends TableSeatSpecificEvent {
    callHandler(topic: string, params: string[]): void {
        const event = new events.EventPlayerWinsAllPots(params);
        if (event.tableNumber != this.tableNumber || event.tableSeatNumber != this.tableSeatNumber) return;

        Log(
            LogTag.SmartContract,
            `Event: ${topic} -> Table ${event.tableNumber} TableSeatNumber ${event.tableSeatNumber} TotalPotSize ${event.totalPotSize}`
        );
    }
}

export class GameEndedEvent extends TableSpecificEvent {
    callHandler(topic: string, params: string[]): void {
        const event = new events.EventGameEnded(params);
        if (event.tableNumber != this.tableNumber) return;

        Log(LogTag.SmartContract, `Event: ${topic} -> Table ${event.tableNumber}`);
    }
}

export class GameStartedEvent extends TableSpecificEvent {
    callHandler(topic: string, params: string[]): void {
        const event = new events.EventGameStarted(params);
        if (event.tableNumber != this.tableNumber) return;

        Log(
            LogTag.SmartContract,
            `Event: ${topic} -> Table ${event.tableNumber} paidBigBlindTableSeatNumber ${event.paidBigBlindTableSeatNumber} paidSmallBlindTableSeatNumber ${event.paidSmallBlindTableSeatNumber}`
        );
    }
}
