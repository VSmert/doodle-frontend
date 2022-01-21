<template>
    <Player v-if="player" class="player" :class="['table-seat-' + (player.tableSeatNumber), { playing: player_playing === player.tableSeatNumber }]"
            :doodle="doodle" :player="player"/>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from "vue-property-decorator";

import Player from "@/components/game/player/Player.vue";
import { Doodle, DoodleEvents, EventPlayerJoinsNextBigBlind, EventPlayerJoinsNextHand, EventPlayerLeft } from "@/lib/doodleclient";

import { IPlayer } from "@/components/models/player";
import { ITableSeat } from "@/lib/doodleclient/response_interfaces";
import { toColor } from "./seat_colors";
import { Log, LogTag } from "@/lib/doodleclient/utils/logger";
import { EmptyAgentID } from "@/lib/doodleclient/utils/misc";

@Component({
    components: {
        Player
    },
})
export default class Table extends Vue {
    @Prop() doodle!: Doodle;
    @Prop() tableNumber!: number;
    @Prop() tableSeat!: ITableSeat;

    player : IPlayer | null = null;
    player_playing = 3;

    eventsHandler = new DoodleEvents();

    @Watch("doodle.initialized", { immediate: true})
    async onDoodleChange(initialized : boolean) {
        if(!initialized) return;

        if(this.tableSeat.agentID != EmptyAgentID)
        {
            Log(LogTag.SmartContract, `Table seat ${this.tableSeat.number} ${JSON.stringify(this.tableSeat)}`);
            this.player = this.toPlayer(this.tableSeat);
        }

        this.registerEvents();
    }

    private toPlayer(tableSeat: ITableSeat) : IPlayer {
        const player: IPlayer = { tableNumber: this.tableNumber, tableSeatNumber: tableSeat.number,
                                  name: tableSeat.agentID, color: toColor(tableSeat.number),
                                  bank: tableSeat.chipCount, onTable: 0n,
                                  hasCards: false};

        Log(LogTag.SmartContract, `Table seat ${this.tableSeat.number}: Player ${JSON.stringify(player)}`);
        return player;
    }

    private registerEvents() {

        this.eventsHandler.onDoodlePlayerJoinsNextHand((event: EventPlayerJoinsNextHand) => {
            if (event.tableNumber != this.tableNumber || event.tableSeatNumber != this.tableSeat.number) return;
            Log(LogTag.SmartContract, `Event: EventPlayerJoinsNextHand -> Table ${event.tableNumber} Seat ${event.tableSeatNumber} Chip count: ${event.playersInitialChipCount}`);
        });

        this.eventsHandler.onDoodlePlayerJoinsNextBigBlind((event: EventPlayerJoinsNextBigBlind) => {
            if (event.tableNumber != this.tableNumber || event.tableSeatNumber != this.tableSeat.number) return;
            Log(LogTag.SmartContract, `Event: EventPlayerJoinsNextBigBlind -> Table ${event.tableNumber} Seat ${event.tableSeatNumber} Chip count: ${event.playersInitialChipCount}`);
        });

        this.eventsHandler.onDoodlePlayerLeft((event: EventPlayerLeft) => {
            if (event.tableNumber != this.tableNumber || event.tableSeatNumber != this.tableSeat.number) return;
            Log(LogTag.SmartContract, `Event: EventPlayerLeft -> Table ${event.tableNumber} Seat ${event.tableSeatNumber}`);
        });

        this.doodle.registerEvents(this.eventsHandler);
        Log(LogTag.Site, `Registered events for table seat ${this.tableSeat.number} in table ${this.tableNumber}`);
    }
}
</script>


<style lang="less">
@import "table-seat.less";
</style>
