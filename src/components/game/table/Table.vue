<template>
    <div class="table">
        <div class="card-place">
            <Card v-for="(card, index) in five_cards" :key="index" :card="card" />
        </div>
        <div class="players">
            <Player
                v-for="player in players"
                :key="player.tableSeatNumber"
                class="player"
                :class="['player-' + (player.tableSeatNumber), { playing: player_playing === player.tableSeatNumber }]"
                :player="player"
                :doodle="doodle"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from "vue-property-decorator";

import ICard from "@/components/models/ICard";
import Card from "@/components/game/card/Card.vue";
import Player from "@/components/game/player/Player.vue";
import { Doodle, DoodleEvents, EventGameEnded, EventGameStarted } from "@/lib/doodleclient";

import { IPlayer } from "@/components/models/player";
import { ITableInfo, ITableSeat } from "@/lib/doodleclient/response_interfaces";
import { toColor } from "./seat_colors";
import { Log, LogTag } from "@/lib/doodleclient/utils/logger";

@Component({
    components: {
        Card,
        Player,
    },
})
export default class Table extends Vue {
    @Prop({ default: 0 }) tableNumber!: number;
    @Prop() doodle!: Doodle;

    tableInfo! : ITableInfo;
    players : IPlayer[] = [];
    player_playing = 3;

    mounted(): void {
        console.log(`Table #${this.tableNumber}`);
    }

    @Watch("doodle.initialized", { immediate: true})
    async onDoodleChange(initialized : boolean) {
        if(!initialized) return;

        this.tableInfo = await this.doodle.getTableInfo(this.tableNumber);
        Log(LogTag.SmartContract, "Table info: " + JSON.stringify(this.tableInfo));

        const tableSeats = await this.doodle.getTableSeats(this.tableInfo);
        this.players = this.toPlayers(tableSeats);

        this.registerEvents();
    }

    figures = ["S", "H", "C", "D"];
    values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  private registerEvents() {
    const eventsHandler = new DoodleEvents();

    eventsHandler.onDoodleGameStarted((event: EventGameStarted) => {
      if(event.tableNumber != this.tableNumber) return;
      Log(LogTag.SmartContract, `Event: EventGameStarted -> Table ${event.tableNumber} paidBigBlindTableSeatNumber ${event.paidBigBlindTableSeatNumber} paidSmallBlindTableSeatNumber ${event.paidSmallBlindTableSeatNumber}`);
    });

    eventsHandler.onDoodleGameEnded((event: EventGameEnded) => {
      if(event.tableNumber != this.tableNumber) return;
      Log(LogTag.SmartContract, `Event: EventGameEnded -> Table ${event.tableNumber}`);
    });

    Log(LogTag.Site, `Registered events for table ${this.tableNumber}`);
    this.doodle.registerEvents(eventsHandler);
  }

    private toPlayers(tableSeats: ITableSeat[]) : IPlayer[] {
    const players : IPlayer[] = [];
    for(let index=0;index<tableSeats.length;index++) {
        const tableSeat=tableSeats[index];
        const player: IPlayer={
        tableNumber: this.tableInfo.number, tableSeatNumber: tableSeat.number,
        name: tableSeat.agentID, color: toColor(tableSeat.number),
        bank: tableSeat.chipCount, onTable: 0n,
        hasCards: false,
        };
        players.push(player);
    }

    Log(LogTag.SmartContract, `Loaded ${tableSeats.length} players. ${JSON.stringify(players)}`);
    return players;
    }

    get cards(): ICard[] {
        let all: ICard[] = [];
        for (let figure of this.figures) {
            for (let value of this.values) {
                all.push({ Figure: figure, Value: value });
            }
        }
        return all;
    }

    get five_cards(): ICard[] {
        let fives: ICard[] = [];
        for (let i = 0; i < 5; i++) {
            let drawAgain = true;
            let card: ICard = { Figure: "X", Value: "0" };
            while (drawAgain) {
                let rand_id = Math.floor(Math.random() * this.cards.length);
                card = this.cards[rand_id];
                drawAgain =
                    fives.find((alreadyDrawnCard) => alreadyDrawnCard.Value === card.Value && alreadyDrawnCard.Figure === card.Figure) !== undefined;
            }
            fives.push(card);
        }
        return fives;
    }
}
</script>

<style scoped lang="less">
@import "table.less";
</style>
