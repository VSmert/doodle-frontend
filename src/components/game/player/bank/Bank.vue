<template>
    <div class="bank">
        <div class="bank-value">{{ bankValue }}</div>
        <div class="chips v-10" v-if="hasChipsWithDenomination(10)"></div>
        <div class="chips v-5" v-if="hasChipsWithDenomination(5)"></div>
        <div class="chips v-1" v-if="hasChipsWithDenomination(1)"></div>
    </div>
</template>

<script>
import { Options, Vue } from 'vue-class-component';

@Options({
  props: {
    bankValue: Number,
    bankOnTable: Number
  }
})
export default class Bank extends Vue { 
    get hasChipsWithDenomination() {
            return (denomination) => (this.bankValue - this.bankOnTable) >= 1 / denomination;
    }
}
</script>

<style scoped lang="less" >
  @import '../../table/currency.less';
  @import 'bank.less';
  @import '../chips.less';
</style>