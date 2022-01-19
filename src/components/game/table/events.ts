import * as events from "@/lib/doodleclient/events";
import { LogTag, Log } from "@/lib/doodleclient/utils/logger";
import { IEventHandler } from "@/lib/doodleclient/wasmclient";

export abstract class TableSpecificEvent implements IEventHandler {
    protected readonly tableNumber: number;

    public constructor(tableNumber: number) {
        this.tableNumber = tableNumber;
    }

    abstract callHandler(topic: string, params: string[]): void;
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
