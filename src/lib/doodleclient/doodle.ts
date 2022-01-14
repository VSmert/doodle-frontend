// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import * as events from "./events";
import * as service from "./service";

import { ServiceClient, Transfer } from "./wasmclient";
import { Configuration } from "./wasmclient/configuration";

import { LogTag, Log } from "./utils/logger";
import * as chainHelper from "./utils/chain_helper";
import * as keyPairGenerator from "./utils/key_pair/key_pair_generator";
import configJson from "./config.dev.json";
import { Base58, getAgentId } from "./wasmclient/crypto";
import { ITableInfo, ITableSeat } from "./response_interfaces";

let doodleService: service.DoodleService;
let serviceClient: ServiceClient;

export let userWalletPrivKey: string;
export let userWalletPubKey: string;
export let userWalletAddress: string;

let initialized: boolean;
export async function Initialize(userBase58PrivateKey: string, userBase58PublicKey: string, userAddress: string): Promise<boolean> {
    if (initialized) return initialized;
    Log(LogTag.Site, "Initializing");

    const config: Configuration = new Configuration(configJson);
    Log(LogTag.Site, "Configuration loaded: " + config);

    generateKeyPairAndAddress(userBase58PrivateKey, userBase58PublicKey, userAddress);
    Log(LogTag.Site, `Using private key '${userWalletPrivKey}' public key '${userWalletPubKey}' address '${userWalletAddress}'`);

    config.chainId = await chainHelper.GetChainId(config);
    Log(LogTag.Site, "Using chain " + config.chainId);

    serviceClient = new ServiceClient(config);
    doodleService = new service.DoodleService(serviceClient);
    doodleService.keyPair = {
        publicKey: Base58.decode(userWalletPubKey),
        secretKey: Base58.decode(userWalletPrivKey),
    };
    const tableCount = (await doodleService.getTableCount().call()).tableCount();
    Log(LogTag.SmartContract, "table count: " + tableCount);

    initialized = true;
    Log(LogTag.Site, "Initialization complete");

    return true;
}

function generateKeyPairAndAddress(userBase58PrivateKey: string, userBase58PublicKey: string, userAddress: string) {
    if (userBase58PrivateKey === "" || userAddress === "") {
        const [generatedUserPrivateKey, generatedUserPublicKey, generatedUserAddress] = keyPairGenerator.generatePrivateKeyAndAddress();
        userWalletPrivKey = generatedUserPrivateKey;
        userWalletPubKey = generatedUserPublicKey;
        userWalletAddress = generatedUserAddress;
        Log(LogTag.Site, `Key pair generated.`);
    } else {
        // TODO: validate private key and address passed by the user
        userWalletPrivKey = userBase58PrivateKey;
        userWalletPubKey = userBase58PublicKey;
        userWalletAddress = userAddress;
    }
}

// -------------------------- GoShimmer client ----------------------------

export async function getL1IOTABalance(address: string): Promise<bigint> {
    return await serviceClient.goShimmerClient.getIOTABalance(address);
}

export async function requestL1Funds(address: string): Promise<boolean> {
    return await serviceClient.goShimmerClient.requestFunds(address);
}

// ------------------------- Accounts Service -----------------------------

export async function depositInL2(privateKey: string, publicKey: string, amount: bigint): Promise<boolean> {
    const keypair = keyPairGenerator.getIKeyPair(privateKey, publicKey);
    const agentID = getAgentId(keypair);

    return await serviceClient.goShimmerClient.depositIOTAToAccountInChain(keypair, agentID, amount);
}

export async function getL2IOTABalance(privateKey: string, publicKey: string): Promise<bigint> {
    const keypair = keyPairGenerator.getIKeyPair(privateKey, publicKey);
    const agentID = getAgentId(keypair);

    return await serviceClient.goShimmerClient.getIOTABalanceInChain(agentID);
}

// ------------------------- Doodle Service -------------------------------

export async function getTableInfo(tableNumber: number): Promise<ITableInfo> {
    try {
        Log(LogTag.SmartContract, `Getting info for table ${tableNumber}`);
        const getTableInfoView = doodleService.getTableInfo();
        getTableInfoView.tableNumber(tableNumber);
        const getTableInfoResults = await getTableInfoView.call();

        const tableInfo: ITableInfo = {
            number: tableNumber,
            size: getTableInfoResults.size(),
            smallBlindInSeatNumber: getTableInfoResults.smallBlindInSeatNumber(),
            bigBlindInSeatNumber: getTableInfoResults.bigBlindInSeatNumber(),
            handInProgress: getTableInfoResults.handInProgress(),
            potsCount: getTableInfoResults.potsCount(),
        };
        return tableInfo;
    } catch (ex: unknown) {
        const error = ex as Error;
        Log(LogTag.Error, error.message);
        throw ex;
    }
}

export async function getTableSeats(tableInfo: ITableInfo, tableSeatNumbers?: number[]): Promise<ITableSeat[]> {
    try {
        Log(LogTag.SmartContract, `Getting seat infos for table ${tableInfo.number}`);
        const emptyAgentID = "1111111111111111111111111111111111111";

        const getTableSeatView = doodleService.getTableSeat();
        getTableSeatView.tableNumber(tableInfo.number);

        const tableSeats: ITableSeat[] = [];

        if (!tableSeatNumbers || tableSeatNumbers.length == 0) {
            for (let tableSeatNumber = 1; tableSeatNumber <= tableInfo.size; tableSeatNumber++) {
                getTableSeatView.tableSeatNumber(tableSeatNumber);
                const getTableSeatResult = await getTableSeatView.call();
                const agentID = getTableSeatResult.agentId();
                if (agentID == emptyAgentID) continue;

                const tableSeat: ITableSeat = {
                    number: tableSeatNumber,
                    agentID: agentID,
                    chipCount: getTableSeatResult.chipCount(),
                    isInHand: getTableSeatResult.isInHand(),
                    joiningNextHand: getTableSeatResult.joiningNextHand(),
                    joiningNextBigBlind: getTableSeatResult.joiningNextBigBlind(),
                };
                tableSeats.push(tableSeat);
            }
        } else {
            tableSeatNumbers.forEach(async (tableSeatNumber) => {
                getTableSeatView.tableSeatNumber(tableSeatNumber);
                const getTableSeatResult = await getTableSeatView.call();
                const agentID = getTableSeatResult.agentId();
                if (agentID != emptyAgentID) {
                    const tableSeat: ITableSeat = {
                        number: tableSeatNumber,
                        agentID: agentID,
                        chipCount: getTableSeatResult.chipCount(),
                        isInHand: getTableSeatResult.isInHand(),
                        joiningNextHand: getTableSeatResult.joiningNextHand(),
                        joiningNextBigBlind: getTableSeatResult.joiningNextBigBlind(),
                    };
                    tableSeats.push(tableSeat);
                }
            });
        }

        return tableSeats;
    } catch (ex: unknown) {
        const error = ex as Error;
        Log(LogTag.Error, error.message);
        throw ex;
    }
}

export async function joinNextHand(tableNumber: number, tableSeatNumber: number, initialChipCount: bigint): Promise<boolean> {
    if (initialChipCount <= 0) return false;

    try {
        Log(LogTag.SmartContract, `Joining next hand with ${initialChipCount} IOTA`);
        const joinNextHandFunc = doodleService.joinNextHand();

        if (tableNumber > 0) joinNextHandFunc.tableNumber(tableNumber);
        if (tableSeatNumber > 0) joinNextHandFunc.tableSeatNumber(tableSeatNumber);

        joinNextHandFunc.transfer(Transfer.iotas(initialChipCount));
        joinNextHandFunc.sign(doodleService.keyPair!);
        await joinNextHandFunc.post();

        return true;
    } catch (ex: unknown) {
        const error = ex as Error;
        Log(LogTag.Error, error.message);
        return false;
    }
}

export async function joinNextBigBlind(tableNumber: number, tableSeatNumber: number, initialChipCount: bigint): Promise<boolean> {
    if (initialChipCount <= 0) return false;

    try {
        Log(LogTag.SmartContract, `Joining next big blind with ${initialChipCount} IOTA`);
        const joinNextBigBlindFunc = doodleService.joinNextBigBlind();

        if (tableNumber > 0) joinNextBigBlindFunc.tableNumber(tableNumber);
        if (tableSeatNumber > 0) joinNextBigBlindFunc.tableSeatNumber(tableSeatNumber);

        joinNextBigBlindFunc.transfer(Transfer.iotas(initialChipCount));
        joinNextBigBlindFunc.sign(doodleService.keyPair!);
        await joinNextBigBlindFunc.post();

        return true;
    } catch (ex: unknown) {
        const error = ex as Error;
        Log(LogTag.Error, error.message);
        return false;
    }
}

export async function leaveTable(tableNumber: number): Promise<boolean> {
    try {
        Log(LogTag.SmartContract, `Leaving table ${tableNumber}`);
        const leaveTableFunc = doodleService.leaveTable();
        leaveTableFunc.tableNumber(tableNumber);
        leaveTableFunc.sign(doodleService.keyPair!);
        await leaveTableFunc.post();

        return true;
    } catch (ex: unknown) {
        const error = ex as Error;
        Log(LogTag.Error, error.message);
        return false;
    }
}

export function onDoodleGameEnded(event: events.EventGameEnded): void {
    Log(LogTag.SmartContract, `Event: EventGameEnded -> Table ${event.tableNumber}`);
}

export function onDoodleGameStarted(event: events.EventGameStarted): void {
    Log(LogTag.SmartContract, "Event: EventGameStarted");
}

let onDoodlePlayerJoinsNextBigBlindHandler: undefined | ((event: events.EventPlayerJoinsNextBigBlind) => void);
export function setOnDoodlePlayerJoinsNextBigBlind(handler: (event: events.EventPlayerJoinsNextBigBlind) => void) {
    onDoodlePlayerJoinsNextBigBlindHandler = handler;
}

export function onDoodlePlayerJoinsNextBigBlind(event: events.EventPlayerJoinsNextBigBlind): void {
    Log(LogTag.SmartContract, "Event: EventPlayerJoinsNextBigBlind");

    if (onDoodlePlayerJoinsNextBigBlindHandler) onDoodlePlayerJoinsNextBigBlindHandler(event);
}

let onDoodlePlayerJoinsNextHandHandler: undefined | ((event: events.EventPlayerJoinsNextHand) => void);
export function setOnDoodlePlayerJoinsNextHand(handler: (event: events.EventPlayerJoinsNextHand) => void) {
    onDoodlePlayerJoinsNextHandHandler = handler;
}

export function onDoodlePlayerJoinsNextHand(event: events.EventPlayerJoinsNextHand): void {
    Log(
        LogTag.SmartContract,
        `Event: EventPlayerJoinsNextHand -> Table ${event.tableNumber} Seat ${event.tableSeatNumber} Chip count: ${event.playersInitialChipCount}`
    );
    if (onDoodlePlayerJoinsNextHandHandler) onDoodlePlayerJoinsNextHandHandler(event);
}

let onDoodlePlayerLeftHandler: undefined | ((event: events.EventPlayerLeft) => void);
export function setOnDoodlePlayerLeftHandler(handler: (event: events.EventPlayerLeft) => void) {
    onDoodlePlayerLeftHandler = handler;
}

export function onDoodlePlayerLeft(event: events.EventPlayerLeft): void {
    Log(LogTag.SmartContract, `Event: EventPlayerLeft -> Table ${event.tableNumber} Seat ${event.tableSeatNumber}`);
    if (onDoodlePlayerLeftHandler) onDoodlePlayerLeftHandler(event);
}

export function onDoodlePlayerWinsAllPots(event: events.EventPlayerWinsAllPots): void {
    Log(LogTag.SmartContract, "Event: EventPlayerWinsAllPots");
}
