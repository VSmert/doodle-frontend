<template>
    <div class="bank">
        <div class="bank-value">{{ chipCount }}</div>
        <ChipStack :totalChipCount="mockChips"/>
    </div>
</template>

<script lang ="ts">
import { Options, Vue } from 'vue-class-component';

import ChipStack from '../../chipStack/ChipStack.vue';
import ChipHelper from '../../chipStack/ChipHelper';

@Options({
  props: {
    chipCount: Number,
    bankOnTable: Number
  },
  components : {
    ChipStack
  }
})
export default class Bank extends Vue { 
  chipCount : number;
  
  // TODO: Improve this to use mod 
  get mockChips() : number {
    if(this.chipCount <= 0) return 0
    if(ChipHelper.Denominations.find(t => t == this.chipCount) !== undefined) return this.chipCount

    if(this.chipCount < 5) return 1
    if(this.chipCount <= 9) return 6
    if(this.chipCount < 15) return 11
    if(this.chipCount == 15) return 15
    return 16
  }
}
</script>

<style scoped lang="less" >
  @import '../../table/currency.less';
  @import 'bank.less';
</style>

<style lang="less">
  @import 'bankChipsPositions.less';
</style>