<template>
    <div>
        <div class="avatar" :style="{backgroundColor: player.color || 'dodgerblue'}"></div>
        <Bank v-if="player.bank > 0" :chipCount="player.bank" :bankOnTable="player.onTable" />
        <Bet  v-if="player.onTable > 0" :chipCount="player.onTable"/>
        <div class="name">{{player.name}}</div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import Bank from './bank/Bank.vue'; 
import Bet from './bet/Bet.vue'; 

@Options({
  props: {
    player: Object
  },
  components: {
    Bank, Bet
  }
})
export default class Player extends Vue { }
</script>

<style lang="less" >
  @import 'player.less';
</style>