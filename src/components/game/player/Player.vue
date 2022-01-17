<template>
    <div>
        <div class="avatar" :style="{ backgroundColor: player.color || 'dodgerblue' }"></div>
        <Bank v-if="player.bank > 0" :chipCount="player.bank" :bankOnTable="player.onTable" />
        <Bet v-if="player.onTable > 0" :chipCount="player.onTable" />
        <div class="name">{{ player.name }}</div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import Bank from "./bank/Bank.vue";
import Bet from "./bet/Bet.vue";

export interface IPlayer {
    name: string;
    color: string;
    bank: bigint;
    onTable: bigint;
    hasCards: boolean;
}

@Component({
    components: {
        Bank,
        Bet,
    },
})
export default class Player extends Vue {
    @Prop(Object) player!: IPlayer;
}
</script>

<style lang="less">
@import "player.less";
</style>
