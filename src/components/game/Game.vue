<template>
    <div class="bg">
        <div id="game">
            <Table :tableNumber="currentTableNumber" :doodle="doodle" />
            <ButtonGroup class="left">
                <Button class="purple" :isPressable="!requestingFunds && userData.l2Balance == 0" @button-pressed="requestFunds">
                    <div v-if="requestingFunds">Requesting...</div>
                    <div v-else-if="userData.l2Balance == 0">Request play IOTA</div>
                    <div v-else>L2 Balance: {{ userData.l2Balance }} IOTA</div>
                </Button>
            </ButtonGroup>
            <ButtonGroup class="right">
                <Button class="red" @button-pressed="leaveTable">Leave table</Button>
                <Button class="green" @button-pressed="joinNextHand">Join next hand</Button>
                <Button class="green" @button-pressed="joinNextBigBlind">Join next big blind</Button>
            </ButtonGroup>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import { useStorage } from "@vueuse/core";

import { Doodle } from "@/lib/doodleclient/doodle";
import { Log, LogTag } from "@/lib/doodleclient/utils/logger";
import * as miscUtils from "@/lib/doodleclient/utils/misc";

import Table from "./table/Table.vue";
import ButtonGroup from "./buttons/ButtonGroup.vue";
import Button from "./buttons/Button.vue";

@Component({
    components: {
        Table,
        ButtonGroup,
        Button
    },
})
export default class Game extends Vue {
    private userData: UserData = new UserData("", "", "");
    private currentTableNumber = 5;

    private requestingFunds = false;
    private doodle: Doodle = new Doodle();

    mounted(){
        this.doodle = new Doodle();
    }

    @Watch("doodle")
    async onDoodleChange(doodle : Doodle) {
        if(!doodle.initialized)
            await this.loadUserKeyPairAndAddress(doodle);
    }

    private async loadUserKeyPairAndAddress(doodle : Doodle): Promise<void> {
        if(doodle.initialized) return;

        const userBase58PrivateKeyStorage = useStorage("user-base58-private-key", "");
        const userBase58PublicKeyStorage = useStorage("user-base58-public-key", "");
        const userAddressStorage = useStorage("user-address", "");

        let userBase58PrivateKey = userBase58PrivateKeyStorage.value;
        let userBase58PublicKey = userBase58PublicKeyStorage.value;
        let userAddress = userAddressStorage.value;

        const success = await doodle.initialize(userBase58PrivateKey, userBase58PublicKey, userAddress);
        if (!success) throw new Error("Could not initialize doodle client");
        const arePrivatekeyAndAddressDefined = userBase58PrivateKey !== "" && userBase58PublicKey !== "" && userAddress !== "";
        if (!arePrivatekeyAndAddressDefined) {
            userBase58PrivateKeyStorage.value = doodle.userWalletPrivKey;
            userBase58PublicKeyStorage.value = doodle.userWalletPubKey;
            userAddressStorage.value = doodle.userWalletAddress;
        }

        this.userData = new UserData(userBase58PrivateKeyStorage.value, userBase58PublicKeyStorage.value, userAddressStorage.value);
        await this.updateL1Balance();
        await this.updateL2Balance();
        this.logL1Balance();
        this.logL2Balance();
    }

    async requestFunds(): Promise<void> {
        this.requestingFunds = true;

        this.userData.l1Balance = await this.requestL1Funds();
        this.logL1Balance();

        this.userData.l2Balance = await this.depositInL2(1201n);

        this.logL1Balance();
        this.logL2Balance();

        this.requestingFunds = false;
    }

    private logL1Balance() {
        if (!this.userData) return;
        Log(LogTag.Funds, `Funds available in L1: ${this.userData.l1Balance} IOTA`);
    }

    private logL2Balance() {
        if (!this.userData) return;
        Log(LogTag.Funds, `Funds available in L2: ${this.userData.l2Balance} IOTA`);
    }

    private async requestL1Funds(): Promise<bigint> {
        let userL1Balance = await this.doodle.getL1IOTABalance(this.userData.address);
        if (userL1Balance > 0) return userL1Balance;

        Log(LogTag.Funds, "Requesting funds");

        const success = await this.doodle.requestL1Funds(this.userData.address);
        const couldNotGetFundsError = "Could not request dummy IOTA from faucet.";

        if (!success) {
            Log(LogTag.Error, couldNotGetFundsError);
            return 0n;
        }

        await miscUtils.delay(3000);
        for (let tryNumber = 1; tryNumber <= 5; tryNumber++) {
            userL1Balance = await this.doodle.getL1IOTABalance(this.userData.address);
            if (userL1Balance > 0n) break;
            await miscUtils.delay(3000);
        }

        if (userL1Balance > 0n) return userL1Balance;

        Log(LogTag.Error, couldNotGetFundsError);
        return 0n;
    }

    private async depositInL2(depositToChainAmount: bigint): Promise<bigint> {
        if (this.userData.l1Balance < depositToChainAmount) {
            Log(LogTag.Error, `L1 balance of ${this.userData.l1Balance} is lower than ${depositToChainAmount}`);
        } else {
            Log(LogTag.Funds, `Depositing ${depositToChainAmount} IOTA from L1 to L2. Recipient account: ${this.userData.address}`);
            const success = await this.doodle.depositInL2(this.userData.privateKey, this.userData.publicKey, depositToChainAmount);

            const couldNotDepositToL2Error = "Could not deposit to L2.";

            if (!success) {
                Log(LogTag.Error, couldNotDepositToL2Error);
                return 0n;
            }

            let userL2Balance = 0n;

            await miscUtils.delay(2000);
            for (let tryNumber = 1; tryNumber <= 5; tryNumber++) {
                userL2Balance = await this.doodle.getL2IOTABalance(this.userData.privateKey, this.userData.publicKey);
                if (userL2Balance > 0n) break;
                Log(LogTag.Funds, `Try #${tryNumber} -> Retrying...`);
                await miscUtils.delay(2000);
            }

            if (userL2Balance > 0n) {
                await this.updateL1Balance();
                return userL2Balance;
            }

            Log(LogTag.Error, couldNotDepositToL2Error);
            return 0n;
        }

        const balanceInL2 = await this.doodle.getL2IOTABalance(this.userData.privateKey, this.userData.publicKey);
        return balanceInL2;
    }

    private async updateL1Balance(): Promise<void> {
        this.userData.l1Balance = await this.doodle.getL1IOTABalance(this.userData.address);
    }

    private async updateL2Balance(): Promise<void> {
        this.userData.l2Balance = await this.doodle.getL2IOTABalance(this.userData.privateKey, this.userData.publicKey);
    }

    async joinNextHand(): Promise<void> {
        // TODO: Pass table and table seat number
        const success = await this.doodle.joinNextHand(this.currentTableNumber, 1, 400n);
        if (success) {
            await miscUtils.delay(4000);
            await this.updateL2Balance();
            this.logL2Balance();
        }
    }
    async joinNextBigBlind(): Promise<void> {
        // TODO: Pass table and table seat number
        const success = await this.doodle.joinNextBigBlind(this.currentTableNumber, 1, 400n);
        if (success) {
            await miscUtils.delay(4000);
            await this.updateL2Balance();
            this.logL2Balance();
        }
    }

    async leaveTable(): Promise<void> {
        const success = await this.doodle.leaveTable(this.currentTableNumber);
        if (success) {
            await miscUtils.delay(4000);
            await this.updateL2Balance();
            this.logL2Balance();
        }
    }
}

class UserData {
    privateKey: string;
    publicKey: string;
    address: string;
    l1Balance = 0n;
    l2Balance = 0n;
    chainBalance = 0n;

    constructor(privateKey: string, publicKey: string, address: string) {
        this.privateKey = privateKey;
        this.publicKey = publicKey;
        this.address = address;
    }
}
</script>

<style lang="less">
@import "game.less";
</style>
