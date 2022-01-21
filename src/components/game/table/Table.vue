<template>
    <div class="table">
        <div class="card-place">
            <Card v-for="(card, index) in five_cards" :key="index" :card="card" />
        </div>
        <div class="table-seats">
            <TableSeat v-for="tableSeat in tableSeats" :key="tableSeat.Number"
            :doodle="doodle" :tableNumber="tableNumber" :tableSeat="tableSeat"/>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from "vue-property-decorator";

import ICard from "@/components/models/ICard";
import Card from "@/components/game/card/Card.vue";
import TableSeat from "@/components/game/table/tableSeat/TableSeat.vue";
import { Doodle, DoodleEvents, EventGameEnded, EventGameStarted } from "@/lib/doodleclient";

import { ITableInfo, ITableSeat } from "@/lib/doodleclient/response_interfaces";
import { Log, LogTag } from "@/lib/doodleclient/utils/logger";

@Component({
    components: {
        Card,
        TableSeat,
    },
})
export default class Table extends Vue {
    @Prop({ default: 0 }) tableNumber!: number;
    @Prop() doodle!: Doodle;

    tableInfo! : ITableInfo;
    tableSeats : ITableSeat[] = [];

    player_playing = 3;

    mounted(): void {
        console.log(`Table #${this.tableNumber}`);
    }

    @Watch("doodle.initialized", { immediate: true})
    async onDoodleChange(initialized : boolean) {
        if(!initialized) return;

        this.tableInfo = await this.doodle.getTableInfo(this.tableNumber);
        Log(LogTag.SmartContract, "Table info: " + JSON.stringify(this.tableInfo));

        this.tableSeats = await this.doodle.getTableSeats(this.tableInfo);

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
