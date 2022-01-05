// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import * as events from './events';
import * as service from './service';

import { ServiceClient, Colors } from './wasmclient';
import { Buffer } from './wasmclient/buffer';
import { Configuration } from './wasmclient/configuration';
import { IKeyPair } from './wasmclient/crypto';

import { LogTag, Log } from './utils/logger';
import * as waspHelper from './utils/wasp_helper';
import configJson from './config.dev.json';

let doodleService: service.DoodleService;
let serviceClient: ServiceClient;
let walletService: waspHelper.WalletService;
let basicClient: waspHelper.BasicClient;

export let userWalletPrivKey: string;
export let userWalletPubKey: string;
export let userWalletAddress: string;

let userSecretKey: Buffer;
let userPublicKey: Buffer;
let initialized: boolean;
export async function Initialize(
    userBase58PrivateKey: string,
    userBase58PublicKey: string,
    userAddress: string
): Promise<boolean> {
    if (initialized) return initialized;
    Log(LogTag.Site, 'Initializing');

    const config: Configuration = new Configuration(configJson);
    Log(LogTag.Site, 'Configuration loaded: ' + config);

    generateKeyPairAndAddress(userBase58PrivateKey, userBase58PublicKey, userAddress);
    Log(
        LogTag.Site,
        `Using private key '${userWalletPrivKey}' public key '${userBase58PublicKey}' address '${userWalletAddress}'`
    );

    basicClient = waspHelper.GetBasicClient(config);
    walletService = new waspHelper.WalletService(basicClient);
    Log(LogTag.Site, 'Wallet service initialized');

    config.chainId = await waspHelper.GetChainId(config);
    Log(LogTag.Site, 'Using chain ' + config.chainId);

    serviceClient = new ServiceClient(config);
    doodleService = new service.DoodleService(serviceClient);
    const keypair: IKeyPair = {
        publicKey: userPublicKey,
        secretKey: userSecretKey,
    };
    doodleService.keyPair = keypair;
    const tableCount = (await doodleService.getTableCount().call()).tableCount();
    Log(LogTag.SmartContract, 'table count: ' + tableCount);

    initialized = true;
    Log(LogTag.Site, 'Initialization complete');

    return true;
}

function generateKeyPairAndAddress(userBase58PrivateKey: string, userBase58PublicKey: string, userAddress: string) {
    if (userBase58PrivateKey === '' || userAddress === '' || !userSecretKey) {
        const [generatedUserPrivateKey, generatedUserPublicKey, generatedUserAddress, secretKey, publicKey] =
            waspHelper.generatePrivateKeyAndAddress();
        userWalletPrivKey = generatedUserPrivateKey;
        userWalletPubKey = generatedUserPublicKey;
        userWalletAddress = generatedUserAddress;
        userPublicKey = publicKey;
        userSecretKey = secretKey;
        Log(LogTag.Site, `Key pair generated.`);
    } else {
        // TODO: validate private key and address passed by the user
        userWalletPrivKey = userBase58PrivateKey;
        userWalletPubKey = userBase58PublicKey;
        userWalletAddress = userAddress;
    }
}

export async function joinNextHand(tableNumber: number, tableSeatNumber: number): Promise<boolean> {
    try {
        Log(LogTag.Site, 'Executing joinNextHand');
        const joinNextHandFunc = doodleService.joinNextHand();
        joinNextHandFunc.tableNumber(tableNumber);
        joinNextHandFunc.tableSeatNumber(tableSeatNumber);
        await joinNextHandFunc.post();
        return true;
    } catch (ex: unknown) {
        const error = ex as Error;
        Log(LogTag.Error, error.message);
        return false;
    }
}

export async function joinNextBigBlind(tableNumber: number, tableSeatNumber: number): Promise<boolean> {
    try {
        Log(LogTag.Site, 'Executing joinNextBigBlind');
        const joinNextBigBlindFunc = doodleService.joinNextBigBlind();
        joinNextBigBlindFunc.tableNumber(tableNumber);
        joinNextBigBlindFunc.tableSeatNumber(tableSeatNumber);
        await joinNextBigBlindFunc.post();
        return true;
    } catch (ex: unknown) {
        const error = ex as Error;
        Log(LogTag.Error, error.message);
        return false;
    }
}

export async function requestFunds(address: string): Promise<boolean> {
    try {
        const faucetRequestContext = await walletService.getFaucetRequest(address);
        const response = await basicClient.sendFaucetRequest(faucetRequestContext.faucetRequest);
        const success = response.error === undefined && response.id !== undefined;
        return success;
    } catch (ex: unknown) {
        const error = ex as Error;
        Log(LogTag.Error, error.message);
        return false;
    }
}

export async function getIOTABalance(address: string): Promise<bigint> {
    const iotaBalance = await walletService.getFunds(address, Colors.IOTA_COLOR_STRING);
    return iotaBalance;
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
