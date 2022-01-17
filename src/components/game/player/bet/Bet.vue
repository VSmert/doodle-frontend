<template>
    <div class="bet">
        <div class="bet-value">{{ chipCount }}</div>
        <ChipStack :totalChipCount="chipCount" />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import ChipStack from "@/components/game/chipStack/ChipStack.vue";

@Component({
    components: { ChipStack }
})
export default class Bet extends Vue {
    @Prop() chipCount!: bigint;
}
</script>

<style scoped lang="less">
@import "@/components/game/table/currency.less";
@import "bet.less";
</style>

<style lang="less">
@import "betChipsPositions.less";
</style>
