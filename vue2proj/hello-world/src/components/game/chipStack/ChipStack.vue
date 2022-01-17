<template>
    <div class="chipStack" v-if="totalChipCount > 0">
        <Chip
            v-for="denomination in chipDenominations"
            :key="denomination"
            :denomination="denomination"
            :chipCount="chipCountInDenomination(denomination)"
        />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import Chip from "./Chip.vue";
import ChipHelper from "./ChipHelper";
import IChipStack from "@/components/models/IChipStack";

@Component({
    components: { Chip },
})
export default class Bet extends Vue {
    @Prop(Number) totalChipCount = 0n;

    get chipDenominations(): number[] {
        return ChipHelper.Denominations;
    }

    get totalDenominationChipCount(): IChipStack[] {
        let totalDenominationChipCount: IChipStack[] = [];
        let accountedForChips = 0n;
        this.chipDenominations.forEach((denomination) => {
            if (this.totalChipCount == accountedForChips) return;

            const denominationBigInt = BigInt(denomination);
            const chipsToEvaluate = BigInt(this.totalChipCount) - BigInt(accountedForChips);
            let chipsInDenomination = Math.floor(Number(chipsToEvaluate / denominationBigInt));
            if (chipsInDenomination > 0) {
                let chipStack: IChipStack = { Denomination: denomination, Count: chipsInDenomination };
                totalDenominationChipCount.push(chipStack);
                accountedForChips += BigInt(chipsInDenomination) * denominationBigInt;
            }
        });
        return totalDenominationChipCount;
    }

    get chipCountInDenomination() {
        return (denomination: number): number => {
            let chipCountInDenomination = this.totalDenominationChipCount.find((t) => t.Denomination == denomination)?.Count ?? 0;
            return chipCountInDenomination;
        };
    }
}
</script>
