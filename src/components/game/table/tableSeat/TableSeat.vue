<template>
    <Player v-if="player" class="player" :class="['table-seat-' + (tableSeatNumber), { playing: player_playing === tableSeatNumber }]"
            :doodle="doodle" :player="player"/>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from "vue-property-decorator";

import Player from "@/components/game/player/Player.vue";
import { Doodle, DoodleEvents, EventPlayerJoinsNextBigBlind, EventPlayerJoinsNextHand, EventPlayerLeft } from "@/lib/doodleclient";

import { IPlayer } from "@/components/models/player";
import { ITableInfo, ITableSeat } from "@/lib/doodleclient/response_interfaces";
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
    @Prop() tableInfo!: ITableInfo;
    @Prop() tableSeatNumber!: number;

    tableSeat: ITableSeat = { number: 0, agentID: EmptyAgentID, chipCount: 0n,
                              isInHand: false, joiningNextBigBlind : false, joiningNextHand: false };
    player : IPlayer | null = null;
    player_playing = 3;

    eventsHandler = new DoodleEvents();

    @Watch("doodle.initialized", { immediate: true})
    async onDoodleChange(initialized : boolean) {
        if(!initialized) return;

        await this.updateTableSeat();

        this.setEvents();
        this.registerEvents();
    }

    private async updateTableSeat() {
        const tableSeats = await this.doodle.getTableSeats(this.tableInfo, [this.tableSeatNumber]);
        if(tableSeats.length != 1)
        {
            const invalidAmountOfTableSeatsErrorMessage = `Invalid amount of table seats. Queried table seat ${this.tableSeatNumber} got ${tableSeats.length}`;
            Log(LogTag.SmartContract, invalidAmountOfTableSeatsErrorMessage)
            throw Error(invalidAmountOfTableSeatsErrorMessage);
        }

        this.tableSeat = tableSeats[0];
        this.player = this.tableSeat.agentID == EmptyAgentID ? null : this.toPlayer(this.tableSeat);
    }

    private toPlayer(tableSeat: ITableSeat) : IPlayer {
        const player: IPlayer = { tableNumber: this.tableInfo.number, tableSeatNumber: tableSeat.number,
                                  name: tableSeat.agentID, color: toColor(tableSeat.number),
                                  bank: tableSeat.chipCount, onTable: 0n,
                                  hasCards: false};

        Log(LogTag.SmartContract, `Table seat ${this.tableSeat.number}: Player ${JSON.stringify(player)}`);
        return player;
    }

    private setEvents(){
        this.eventsHandler.onDoodlePlayerJoinsNextHand(async (event: EventPlayerJoinsNextHand) => {
            if (event.tableNumber != this.tableInfo.number || event.tableSeatNumber != this.tableSeat.number) return;

            Log(LogTag.SmartContract, `Event: EventPlayerJoinsNextHand -> Table ${event.tableNumber} Seat ${event.tableSeatNumber} Chip count: ${event.playersInitialChipCount}`);
            await this.updateTableSeat();
        });

        this.eventsHandler.onDoodlePlayerJoinsNextBigBlind(async (event: EventPlayerJoinsNextBigBlind) => {
            if (event.tableNumber != this.tableInfo.number || event.tableSeatNumber != this.tableSeat.number) return;

            Log(LogTag.SmartContract, `Event: EventPlayerJoinsNextBigBlind -> Table ${event.tableNumber} Seat ${event.tableSeatNumber} Chip count: ${event.playersInitialChipCount}`);
            await this.updateTableSeat();
        });

        this.eventsHandler.onDoodlePlayerLeft(async (event: EventPlayerLeft) => {
            if (event.tableNumber != this.tableInfo.number || event.tableSeatNumber != this.tableSeat.number) return;

            Log(LogTag.SmartContract, `Event: EventPlayerLeft -> Table ${event.tableNumber} Seat ${event.tableSeatNumber}`);
            await this.updateTableSeat();
        });
    }

    private registerEvents() {
        this.doodle.registerEvents(this.eventsHandler);
        Log(LogTag.Site, `Registered events for table seat ${this.tableSeat.number} in table ${this.tableInfo.number}`);
    }
}
</script>


<style lang="less">
@import "table-seat.less";
</style>
