<template>
    <div class="bg">
        <div id="game">
            <Table />
            <ButtonGroup class="left">
                <Button class="purple">Request play IOTA</Button>
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
    async mounted() {
        await this.loadUserKeyPairAndAddress();
    }

    private async loadUserKeyPairAndAddress(): Promise<void> {
        const userBase58PrivateKeyStorage = useStorage('user-base58-private-key', "")
        const userBase58PublicKeyStorage = useStorage('user-base58-public-key', "")
        const userAddressStorage = useStorage('user-address', "");

        let userBase58PrivateKey = userBase58PrivateKeyStorage.value;
        let userBase58PublicKey = userBase58PublicKeyStorage.value;
        let userAddress = userAddressStorage.value;

        const success = await doodleClient.Initialize(userBase58PrivateKey, userBase58PublicKey, userAddress)
        if(!success) return;

        const arePrivatekeyAndAddressDefined = userBase58PrivateKey !== "" && userBase58PublicKey !== "" && userAddress !== "";
        if(!arePrivatekeyAndAddressDefined) {
            userBase58PrivateKeyStorage.value = doodleClient.userWalletPrivKey;
            userBase58PublicKeyStorage.value = doodleClient.userWalletPubKey;
            userAddressStorage.value = doodleClient.userWalletAddress;
        }
    }
}
</script>

<style lang="less">
@import 'game.less';
</style>
