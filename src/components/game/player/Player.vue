<template>
    <div>
        <div class="avatar" :style="{ backgroundColor: player.color || 'dodgerblue' }"></div>
        <Bank v-if="player.bank > 0" :chipCount="player.bank" :bankOnTable="player.onTable" />
        <Bet v-if="player.onTable > 0" :chipCount="player.onTable" />
        <div class="name">{{ player.name }}</div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from "vue-property-decorator";

import Bank from "./bank/Bank.vue";
import Bet from "./bet/Bet.vue";
import { IPlayer } from "@/components/models/player"
import { Doodle, DoodleEvents, EventPlayerWinsAllPots } from "@/lib/doodleclient";
import { Log, LogTag } from "@/lib/doodleclient/utils/logger";

@Component({
    components: {
        Bank,
        Bet,
    },
})
export default class Player extends Vue {
    @Prop() player!: IPlayer;
    @Prop() doodle!: Doodle;

    eventsHandler = new DoodleEvents();

    @Watch("doodle.initialized", { immediate: true})
    onDoodleChange(initialized : boolean) {
        if(!initialized) return;

        this.setEvents();
        this.registerEvents();
    }

    private setEvents(){
        this.eventsHandler.onDoodlePlayerWinsAllPots((event: EventPlayerWinsAllPots) => {
            if (event.tableNumber != this.player.tableNumber || event.tableSeatNumber != this.player.tableSeatNumber) return;
            Log(LogTag.SmartContract, `Event: PlayerWinsAllPots -> Table ${event.tableNumber} TableSeatNumber ${event.tableSeatNumber} TotalPotSize ${event.totalPotSize}`);
        });
    }

    private registerEvents() {
        this.doodle.registerEvents(this.eventsHandler);
    }
}
</script>