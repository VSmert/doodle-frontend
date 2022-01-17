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
    @Prop() chipCount!: bigint;
    @Prop() bankOnTable!: bigint;

    // TODO: Improve this to use mod
    get mockChips(): bigint {
        if (this.chipCount <= 0n) return 0n;
        if (ChipHelper.Denominations.find((t) => t == Number(this.chipCount)) !== undefined) return this.chipCount;

        if (this.chipCount < 5n) return 1n;
        if (this.chipCount <= 9n) return 6n;
        if (this.chipCount < 15n) return 11n;
        if (this.chipCount == 15n) return 15n;
        return 16n;
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
