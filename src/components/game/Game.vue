<template>
    <div class="bg">
        <div id="game">
            <Table />
            <ButtonGroup class="left">
                <Button class="purple" :isPressable="userData.balance == 0" @button-pressed="requestFunds">
                    <div v-if="userData.balance == 0">Request play IOTA</div>
                    <div v-else>Balance: {{ userData.balance }} IOTA</div>
                </Button>
            </ButtonGroup>
            <ButtonGroup class="right">
                <Button class="red">Leave table</Button>
                <Button class="green">Join next hand</Button>
                <Button class="green">Join next big blind</Button>
            </ButtonGroup>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { useStorage } from '@vueuse/core'

import * as doodleClient from '../../lib/doodleclient/doodle'

import Table from './table/Table.vue';
import ButtonGroup from './buttons/ButtonGroup.vue';
import Button from './buttons/Button.vue';

@Options({
    components: {
        Table,
        ButtonGroup,
        Button
    },
})
export default class Game extends Vue {
    userData : UserData = new UserData("", "", "", 0n);

    async mounted() {
        this.userData = await this.loadUserKeyPairAndAddress();
    }

    private async loadUserKeyPairAndAddress(): Promise<UserData> {
        const userBase58PrivateKeyStorage = useStorage('user-base58-private-key', "")
        const userBase58PublicKeyStorage = useStorage('user-base58-public-key', "")
        const userAddressStorage = useStorage('user-address', "");

        let userBase58PrivateKey = userBase58PrivateKeyStorage.value;
        let userBase58PublicKey = userBase58PublicKeyStorage.value;
        let userAddress = userAddressStorage.value;

        const success = await doodleClient.Initialize(userBase58PrivateKey, userBase58PublicKey, userAddress)
        if(!success) throw new Error("Could not initialize doodle client");

        const arePrivatekeyAndAddressDefined = userBase58PrivateKey !== "" && userBase58PublicKey !== "" && userAddress !== "";
        if(!arePrivatekeyAndAddressDefined) {
            userBase58PrivateKeyStorage.value = doodleClient.userWalletPrivKey;
            userBase58PublicKeyStorage.value = doodleClient.userWalletPubKey;
            userAddressStorage.value = doodleClient.userWalletAddress;
        }
        const userBalance = await doodleClient.getIOTABalance(userAddressStorage.value);
        let userData = new UserData(userBase58PrivateKeyStorage.value, userBase58PublicKeyStorage.value, userAddressStorage.value, userBalance);
        return userData
    }

    async requestFunds () : Promise<void>{
    }
}

class UserData {
    privateKey : string;
    publicKey : string;
    address : string;
    balance : bigint;

    constructor(privateKey : string, publicKey : string, address : string, balance : bigint) {
        this.privateKey = privateKey;
        this.publicKey = publicKey
        this.address = address;
        this.balance = balance;
    }
}
</script>

<style lang="less">
@import 'game.less';
</style>
