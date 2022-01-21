// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import * as service from "./service";
import { ServiceClient, Transfer, IEventHandler } from "./wasmclient";
import { Configuration } from "./wasmclient/configuration";

import { LogTag, Log } from "./utils/logger";
import * as chainHelper from "./utils/chain_helper";
import * as keyPairGenerator from "./utils/key_pair/key_pair_generator";
import configJson from "./config.dev.json";
import { Base58, getAgentId } from "./wasmclient/crypto";
import { ITableInfo, ITableSeat } from "./response_interfaces";

export class Doodle {
    private doodleService: service.DoodleService | undefined;
    private serviceClient: ServiceClient | undefined;

    public userWalletPrivKey: string | undefined;
    public userWalletPubKey: string | undefined;
    public userWalletAddress: string | undefined;

    public initialized = false;
    public async initialize(userBase58PrivateKey: string, userBase58PublicKey: string, userAddress: string): Promise<boolean> {
        if (this.initialized) return this.initialized;
        Log(LogTag.Site, "Initializing");

        const config: Configuration = new Configuration(configJson);
        Log(LogTag.Site, "Configuration loaded: " + config);

        this.generateKeyPairAndAddress(userBase58PrivateKey, userBase58PublicKey, userAddress);
        Log(LogTag.Site, `Using private key '${this.userWalletPrivKey}' public key '${this.userWalletPubKey}' address '${this.userWalletAddress}'`);

        config.chainId = await chainHelper.GetChainId(config);
        Log(LogTag.Site, "Using chain " + config.chainId);

        this.serviceClient = new ServiceClient(config);
        this.doodleService = new service.DoodleService(this.serviceClient);
        this.doodleService.keyPair = {
            publicKey: Base58.decode(this.userWalletPubKey!),
            secretKey: Base58.decode(this.userWalletPrivKey!),
        };
        const tableCount = (await this.doodleService.getTableCount().call()).tableCount();
        Log(LogTag.SmartContract, "table count: " + tableCount);

        this.initialized = true;
        Log(LogTag.Site, "Initialization complete");

        return true;
    }

    public registerEvents(eventHandler: IEventHandler): void {
        this.doodleService!.register(eventHandler);
    }

    private generateKeyPairAndAddress(userBase58PrivateKey: string, userBase58PublicKey: string, userAddress: string) {
        if (userBase58PrivateKey === "" || userAddress === "") {
            const [generatedUserPrivateKey, generatedUserPublicKey, generatedUserAddress] = keyPairGenerator.generatePrivateKeyAndAddress();
            this.userWalletPrivKey = generatedUserPrivateKey;
            this.userWalletPubKey = generatedUserPublicKey;
            this.userWalletAddress = generatedUserAddress;
            Log(LogTag.Site, `Key pair generated.`);
        } else {
            // TODO: validate private key and address passed by the user
            this.userWalletPrivKey = userBase58PrivateKey;
            this.userWalletPubKey = userBase58PublicKey;
            this.userWalletAddress = userAddress;
        }
    }

    // -------------------------- GoShimmer client ----------------------------

    public async getL1IOTABalance(address: string): Promise<bigint> {
        return await this.serviceClient!.goShimmerClient.getIOTABalance(address);
    }

    public async requestL1Funds(address: string): Promise<boolean> {
        return await this.serviceClient!.goShimmerClient.requestFunds(address);
    }

    // ------------------------- Accounts Service -----------------------------

    public async depositInL2(privateKey: string, publicKey: string, amount: bigint): Promise<boolean> {
        const keypair = keyPairGenerator.getIKeyPair(privateKey, publicKey);
        const agentID = getAgentId(keypair);

        return await this.serviceClient!.goShimmerClient.depositIOTAToAccountInChain(keypair, agentID, amount);
    }

    public async getL2IOTABalance(privateKey: string, publicKey: string): Promise<bigint> {
        const keypair = keyPairGenerator.getIKeyPair(privateKey, publicKey);
        const agentID = getAgentId(keypair);

        return await this.serviceClient!.waspClient.getIOTABalanceInChain(agentID);
    }

    // ------------------------- Doodle Service -------------------------------

    public async getTableInfo(tableNumber: number): Promise<ITableInfo> {
        try {
            Log(LogTag.SmartContract, `Getting info for table ${tableNumber}`);
            const getTableInfoView = this.doodleService!.getTableInfo();
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

    public async getTableSeats(tableInfo: ITableInfo, tableSeatNumbers?: number[]): Promise<ITableSeat[]> {
        try {
            Log(LogTag.SmartContract, `Getting seat infos for table ${tableInfo.number}`);

            const getTableSeatView = this.doodleService!.getTableSeat();
            getTableSeatView.tableNumber(tableInfo.number);

            const tableSeats: ITableSeat[] = [];

            if (!tableSeatNumbers || tableSeatNumbers.length == 0) {
                for (let tableSeatNumber = 1; tableSeatNumber <= tableInfo.size; tableSeatNumber++) {
                    getTableSeatView.tableSeatNumber(tableSeatNumber);
                    const getTableSeatResult = await getTableSeatView.call();
                    const agentID = getTableSeatResult.agentId();
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
                    const tableSeat: ITableSeat = {
                        number: tableSeatNumber,
                        agentID: agentID,
                        chipCount: getTableSeatResult.chipCount(),
                        isInHand: getTableSeatResult.isInHand(),
                        joiningNextHand: getTableSeatResult.joiningNextHand(),
                        joiningNextBigBlind: getTableSeatResult.joiningNextBigBlind(),
                    };
                    tableSeats.push(tableSeat);
                });
            }

            return tableSeats;
        } catch (ex: unknown) {
            const error = ex as Error;
            Log(LogTag.Error, error.message);
            throw ex;
        }
    }

    public async joinNextHand(tableNumber: number, tableSeatNumber: number, initialChipCount: bigint): Promise<boolean> {
        if (initialChipCount <= 0) return false;

        try {
            Log(
                LogTag.SmartContract,
                `Executing JoinNextHandFunc for table ${tableNumber} tableseat ${tableSeatNumber} with ${initialChipCount} IOTA`
            );
            const joinNextHandFunc = this.doodleService!.joinNextHand();

            if (tableNumber > 0) joinNextHandFunc.tableNumber(tableNumber);
            if (tableSeatNumber > 0) joinNextHandFunc.tableSeatNumber(tableSeatNumber);

            joinNextHandFunc.transfer(Transfer.iotas(initialChipCount));
            joinNextHandFunc.sign(this.doodleService!.keyPair!);
            await joinNextHandFunc.post();

            return true;
        } catch (ex: unknown) {
            const error = ex as Error;
            Log(LogTag.Error, error.message);
            return false;
        }
    }

    public async joinNextBigBlind(tableNumber: number, tableSeatNumber: number, initialChipCount: bigint): Promise<boolean> {
        if (initialChipCount <= 0) return false;

        try {
            Log(
                LogTag.SmartContract,
                `Executing JoinNextBigBlindFunc for table ${tableNumber} tableseat ${tableSeatNumber} with ${initialChipCount} IOTA`
            );
            const joinNextBigBlindFunc = this.doodleService!.joinNextBigBlind();

            if (tableNumber > 0) joinNextBigBlindFunc.tableNumber(tableNumber);
            if (tableSeatNumber > 0) joinNextBigBlindFunc.tableSeatNumber(tableSeatNumber);

            joinNextBigBlindFunc.transfer(Transfer.iotas(initialChipCount));
            joinNextBigBlindFunc.sign(this.doodleService!.keyPair!);
            await joinNextBigBlindFunc.post();

            return true;
        } catch (ex: unknown) {
            const error = ex as Error;
            Log(LogTag.Error, error.message);
            return false;
        }
    }

    public async leaveTable(tableNumber: number): Promise<boolean> {
        try {
            Log(LogTag.SmartContract, `Leaving table ${tableNumber}`);
            const leaveTableFunc = this.doodleService!.leaveTable();
            leaveTableFunc.tableNumber(tableNumber);
            leaveTableFunc.sign(this.doodleService!.keyPair!);
            await leaveTableFunc.post();

            return true;
        } catch (ex: unknown) {
            const error = ex as Error;
            Log(LogTag.Error, error.message);
            return false;
        }
    }
}
