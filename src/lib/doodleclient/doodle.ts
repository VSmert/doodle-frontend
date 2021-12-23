// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import * as events from './events';
import * as service from './service';

import { LogTag, Log } from './utils/logger';
import * as waspHelper from './utils/wasp_helper';
import { Configuration } from './utils/configuration';
import configJson from './config.dev.json';

let doodleService: service.DoodleService;
let walletService: waspHelper.WalletService;
export let userWalletPrivKey: string;
export let userWalletAddress: string;

let initialized: boolean;
export async function Initialize(userBase58PrivateKey: string, userAddress: string): Promise<boolean> {
    if (initialized) return initialized;
    Log(LogTag.Site, 'Initializing');

    const config: Configuration = new Configuration(configJson);
    Log(LogTag.Site, 'Configuration loaded: ' + config);

    generateKeyAndAddress(userBase58PrivateKey, userAddress);
    Log(LogTag.Site, `Using private key '${userWalletPrivKey}' Address: '${userWalletAddress}'`);

    const basicClient = waspHelper.GetBasicClient(config);
    walletService = new waspHelper.WalletService(basicClient);
    Log(LogTag.Site, 'Wallet service initialized');

    config.chainId = await waspHelper.GetChainId(config);
    Log(LogTag.Site, 'Using chain ' + config.chainId);

    doodleService = new service.DoodleService(basicClient, config.chainId);
    const tableCount = (await doodleService.getTableCount().call()).tableCount();
    Log(LogTag.SmartContract, 'table count: ' + tableCount);

    initialized = true;
    Log(LogTag.Site, 'Initialization complete');

    return true;
}

function generateKeyAndAddress(userBase58PrivateKey: string, userAddress: string) {
    if (userBase58PrivateKey === '' || userAddress === '') {
        const [generatedUserPrivateKey, generatedUserAddress] = waspHelper.generatePrivateKeyAndAddress();
        userWalletPrivKey = generatedUserPrivateKey;
        userWalletAddress = generatedUserAddress;
        Log(LogTag.Site, `Key pair generated.`);
    } else {
        // TODO: validate private key and address passed by the user
        userWalletPrivKey = userBase58PrivateKey;
        userWalletAddress = userAddress;
    }
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
