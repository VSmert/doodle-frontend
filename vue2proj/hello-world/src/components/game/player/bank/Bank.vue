<template>
    <div class="bank">
        <div class="bank-value">{{ chipCount }}</div>
        <ChipStack :totalChipCount="mockChips" />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import ChipStack from "@/components/game/chipStack/ChipStack.vue";
import ChipHelper from "@/components/game/chipStack/ChipHelper";

@Component({
    components: {
        ChipStack,
    },
})
export default class Bank extends Vue {
    @Prop(Number) chipCount!: number;
    @Prop(Number) bankOnTable!: number;

    // TODO: Improve this to use mod
    get mockChips(): number {
        if (this.chipCount <= 0) return 0;
        if (ChipHelper.Denominations.find((t) => t == this.chipCount) !== undefined) return this.chipCount;

        if (this.chipCount < 5) return 1;
        if (this.chipCount <= 9) return 6;
        if (this.chipCount < 15) return 11;
        if (this.chipCount == 15) return 15;
        return 16;
    }
}
</script>

<style scoped lang="less">
@import "@/components/game/table/currency.less";
@import "bank.less";
</style>

<style lang="less">
@import "bankChipsPositions.less";
</style>
