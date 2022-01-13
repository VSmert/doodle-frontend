<template>
    <div class="bet">
        <div class="bet-value">{{ chipCount }}</div>
        <ChipStack :totalChipCount="chipCount" />
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import ChipStack from '@/components/game/chipStack/ChipStack.vue';

@Options({
    props: {
        chipCount: Number,
    },
    components: { ChipStack },
})
export default class Bet extends Vue {}
</script>

<style scoped lang="less">
@import '@/components/game/table/currency.less';
@import 'bet.less';
</style>

<style lang="less">
@import 'betChipsPositions.less';
</style>
