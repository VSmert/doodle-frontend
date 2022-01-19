import * as events from "@/lib/doodleclient/events";
import { LogTag, Log } from "@/lib/doodleclient/utils/logger";

import { TableSpecificEvent } from "@/components/game/table/events";

abstract class TableSeatSpecificEvent extends TableSpecificEvent {
    protected readonly tableSeatNumber: number;

    public constructor(tableNumber: number, tableSeatNumber: number) {
        super(tableNumber);
        this.tableSeatNumber = tableSeatNumber;
    }
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
