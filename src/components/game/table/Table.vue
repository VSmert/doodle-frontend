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
import { Doodle } from "@/lib/doodleclient";

import { IPlayer } from "@/components/models/player";
import { ITableInfo } from "@/lib/doodleclient/response_interfaces";
import { GameEndedEvent, GameStartedEvent } from "./events";

@Component({
    components: {
        Card,
        Player,
    },
})
export default class Table extends Vue {
    @Prop({ default: 0 }) tableNumber!: number;
    @Prop() doodle!: Doodle;

    private tableInfo! : ITableInfo;
    private players : IPlayer[] = [];
    private player_playing : number = 3;

    mounted(): void {
        console.log(`Table #${this.tableNumber}`);
    }

    @Watch("doodle.initialized", { immediate: true})
    async onDoodleChange(initialized : boolean) {
        if(!initialized) return;

        this.tableInfo = await this.doodle.getTableInfo(this.tableNumber);
        const tableSeats = await this.doodle.getTableSeats(this.tableInfo);

        // TODO: Extract this mapping into helper function
        for (let index = 0; index < tableSeats.length; index++) {
            const tableSeat = tableSeats[index];
            const player : IPlayer = { tableNumber: this.tableInfo.number, tableSeatNumber : tableSeat.number,
                                       name : tableSeat.agentID, color: "dodgerblue",
                                       bank : tableSeat.chipCount, onTable: 0n,
                                       hasCards: false,  };
            this.players.push(player);
        }

        this.doodle.registerEvents(new GameStartedEvent(this.tableInfo.number));
        this.doodle.registerEvents(new GameEndedEvent(this.tableInfo.number));
    }

    // TODO: Implement seat number to color switch
    //players: IPlayer[] = [

        // { name: "rivy33", color: "dodgerblue", bank: 16n, onTable: 65n, hasCards: false, tableNumber: this.tableNumber, tableSeatNumber : 1 },
        // { name: "kattar", color: "cyan", bank: 80n, onTable: 0n, hasCards: false, tableNumber: this.tableNumber, tableSeatNumber : 2 },
        // { name: "mikelaire", color: "lightcoral", bank: 77n, onTable: 0n, hasCards: false, tableNumber: this.tableNumber, tableSeatNumber : 3 },
        // { name: "tomtom", color: "crimson", bank: 250n, onTable: 0n, hasCards: false, tableNumber: this.tableNumber, tableSeatNumber : 4 },
        // { name: "nana", color: "#444", bank: 45n, onTable: 0n, hasCards: false, tableNumber: this.tableNumber, tableSeatNumber : 5 },
        // { name: "ionion", color: "forestgreen", bank: 125n, onTable: 0n, hasCards: false, tableNumber: this.tableNumber, tableSeatNumber : 6 },
        // { name: "link6996", color: "goldenrod", bank: 13n, onTable: 0n, hasCards: false, tableNumber: this.tableNumber, tableSeatNumber : 7 },
        // { name: "gossboganon", color: "gold", bank: 6n, onTable: 0n, hasCards: false, tableNumber: this.tableNumber, tableSeatNumber : 8 },
    //];

    figures = ["S", "H", "C", "D"];
    values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

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
