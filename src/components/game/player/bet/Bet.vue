<template>
    <div class="bet">
        <div class="bet-value">
            {{ betOnTable }}
        </div>
        <div class="chip-10" v-if="betOnTable / 10 >= 1">	
            <div class="chips v-10" v-for="(n, i) in ((betOnTable - (betOnTable % 10)) / 10)" :key="i" :style="{top: (-2 + (i * 5)) + 'px'}"></div>
        </div>
        <div class="chip-5" v-if="betOnTable % 10 && betOnTable % 10 >= 2">
            <div class="chips v-5" v-for="(n, i) in (((betOnTable % 10) - ((betOnTable % 10) % 2)) / 2)" :key="i" :style="{top: (-2 + (i * 5)) + 'px'}"></div>
        </div>
        <div class="chip-1">
            <div class="chips v-1" v-if="betOnTable % 10 && betOnTable % 2"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Bet',
	props: {
        betOnTable : Number
	},
    computed: {
        // hasChipsWithDenomination() {
        //     return (denomination) => (this.bankValue - this.bankOnTable) >= 1 / denomination;
        // }
    }
}
</script>

<style scoped lang="less" >
  @import '../../table/currency.less';
  @import 'bet.less';
  @import '../chips.less';
</style>