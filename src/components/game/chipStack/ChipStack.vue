<template>
    <div class="chipStack" v-if="totalChipCount > 0">
        <Chip v-for="denomination in chipDenominations" :key="denomination" :denomination="denomination" :chipCount="chipCountInDenomination(denomination)"/>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import Chip from './Chip.vue'; 
import ChipHelper from './ChipHelper';

@Options({
  props: {
    totalChipCount : Number
  },
  components : { Chip }
})
export default class Bet extends Vue { 
    private totalChipCount = 0;
    
    get chipDenominations() : number[] {
        return ChipHelper.Denominations
    }

    get totalDenominationChipCount() : IChipStack[]
    {
        let totalDenominationChipCount : IChipStack[] = [];
        let accountedForChips = 0; 
        this.chipDenominations.forEach(denomination => {
            if(this.totalChipCount == accountedForChips) return;
            
            let chipsInDenomination = Math.floor((this.totalChipCount - accountedForChips) / denomination)
            if(chipsInDenomination > 0){
                let chipStack = { Denomination : denomination, Count: chipsInDenomination}
                totalDenominationChipCount.push(chipStack)
                accountedForChips += chipsInDenomination  * denomination
            }
        })
        return totalDenominationChipCount;
    }

    get chipCountInDenomination() {
        return (denomination : number) => {
            let chipCountInDenomination = this.totalDenominationChipCount.find(t => t.Denomination == denomination)?.Count ?? 0;
            return chipCountInDenomination
        }
    }
}

interface IChipStack {
    Denomination : number;
    Count : number;
}
</script>