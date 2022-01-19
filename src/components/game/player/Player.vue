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
//import { Component, Prop, Watch, Vue } from "vue-property-decorator";

import Bank from "./bank/Bank.vue";
import Bet from "./bet/Bet.vue";
import { IPlayer } from "@/components/models/player"
import { Doodle } from "@/lib/doodleclient";
//import { JoinNextBigBlindEvent, JoinNextHandEvent, PlayerLeftEvent, PlayerWinsAllPotsEvent } from "../table/events";

@Component({
    components: {
        Bank,
        Bet,
    },
})
export default class Player extends Vue {
    @Prop() player!: IPlayer;
    @Prop() doodle!: Doodle;

    // @Watch("doodle.initialized", { immediate: true})
    // onDoodleChange(initialized : boolean) {
    //     if(!initialized) return;

        // this.doodle.registerEvents(new JoinNextHandEvent(this.player));
        // this.doodle.registerEvents(new JoinNextBigBlindEvent(this.player));
        // this.doodle.registerEvents(new PlayerLeftEvent(this.player));
        // this.doodle.registerEvents(new PlayerWinsAllPotsEvent(this.player));
    //}
}
</script>

<style lang="less">
@import "player.less";
</style>
