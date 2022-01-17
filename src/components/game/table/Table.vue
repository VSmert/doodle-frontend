<template>
    <div class="table">
        <div class="card-place">
            <Card v-for="(card, index) in five_cards" :key="index" :card="card" />
        </div>
        <div class="players">
            <Player
                v-for="(player, index) in players"
                :key="index"
                class="player"
                :class="['player-' + (index + 1), { playing: player_playing === index }]"
                :player="player"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import ICard from "@/components/models/ICard";
import Card from "@/components/game/card/Card.vue";
import Player from "@/components/game/player/Player.vue";
import { IPlayer } from "@/components/game/player/Player.vue";
import { Doodle } from "@/lib/doodleclient";
//import * as events from "./events";

@Component({
    components: {
        Card,
        Player,
    },
})
export default class Table extends Vue {
    @Prop({ default: 0 }) tableNumber!: number;
    @Prop(Object) doodle!: Doodle;

    mounted(): void {
        console.log(`Table #${this.tableNumber}`);
        // this.doodle.registerEvents(new events.JoinNextHandEvent());
        // this.doodle.registerEvents(new events.JoinNextBigBlindEvent());
        // this.doodle.registerEvents(new events.PlayerLeftEvent());
        // this.doodle.registerEvents(new events.PlayerWinsAllPotsEvent());
        // this.doodle.registerEvents(new events.GameStartedEvent());
        // this.doodle.registerEvents(new events.GameEndedEvent());
    }

    player_playing = 3;
    players: IPlayer[] = [
        { name: "rivy33", color: "dodgerblue", bank: 16n, onTable: 65n, hasCards: false },
        { name: "kattar", color: "cyan", bank: 80n, onTable: 0n, hasCards: false },
        { name: "mikelaire", color: "lightcoral", bank: 77n, onTable: 0n, hasCards: false },
        { name: "tomtom", color: "crimson", bank: 250n, onTable: 0n, hasCards: false },
        { name: "nana", color: "#444", bank: 45n, onTable: 0n, hasCards: false },
        { name: "ionion", color: "forestgreen", bank: 125n, onTable: 0n, hasCards: false },
        { name: "link6996", color: "goldenrod", bank: 13n, onTable: 0n, hasCards: false },
        { name: "gossboganon", color: "gold", bank: 6n, onTable: 0n, hasCards: false },
    ];
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
