// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import * as events from './events';
import * as service from './service';

import { LogTag, Log } from './utils/logger';
import * as waspHelper from './utils/wasp_helper';
import { Configuration } from './utils/configuration';
import configJson from './config.dev.json';

let doodleService: service.DoodleService;

let initialized: boolean = false;
export async function Initialize(): Promise<void> {
    if (initialized) return;
    Log(LogTag.Site, 'Initializing');

    const config: Configuration = new Configuration(configJson);
    Log(LogTag.Site, 'Configuration loaded: ' + config);

    config.chainId = await waspHelper.GetChainId(config);
    Log(LogTag.Site, 'Using chain ' + config.chainId);

    const basicClient = waspHelper.GetBasicClient(config);
    doodleService = new service.DoodleService(basicClient, config.chainId);
    const tableCount = (await doodleService.getTableCount().call()).tableCount();
    Log(LogTag.SmartContract, 'table count: ' + tableCount);

    initialized = true;
    Log(LogTag.Site, 'Initialization complete!');
}

export function onDoodleGameEnded(event: events.EventGameEnded): void {
    Log(LogTag.SmartContract, `Event: EventGameEnded -> Table ${event.tableNumber}`);
}

export function onDoodleGameStarted(event: events.EventGameStarted): void {
    Log(LogTag.SmartContract, 'Event: EventGameStarted');
}

export function onDoodlePlayerJoinsNextBigBlind(event: events.EventPlayerJoinsNextBigBlind): void {
    Log(LogTag.SmartContract, 'Event: EventPlayerJoinsNextBigBlind');
}

export function onDoodlePlayerJoinsNextHand(event: events.EventPlayerJoinsNextHand): void {
    Log(
        LogTag.SmartContract,
        `Event: EventPlayerJoinsNextHand -> Table ${event.tableNumber} Seat ${event.tableSeatNumber} Chip count: ${event.playersInitialChipCount}`
    );
}

export function onDoodlePlayerLeft(event: events.EventPlayerLeft): void {
    Log(LogTag.SmartContract, `Event: EventPlayerLeft -> Table ${event.tableNumber} Seat ${event.tableSeatNumber}`);
}

export function onDoodlePlayerWinsAllPots(event: events.EventPlayerWinsAllPots): void {
    Log(LogTag.SmartContract, 'Event: EventPlayerWinsAllPots');
}
