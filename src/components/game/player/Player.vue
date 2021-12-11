<template>
    <div>
        <div class="avatar" :style="{backgroundColor: player.color || 'dodgerblue'}"></div>
        <Bank :bankValue="player.bank" :bankOnTable="player.onTable" />
        <Bet :betOnTable="player.onTable"/>
        <div class="name">{{player.name}}</div>
    </div>
</template>

<script>
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

<style scoped lang="less" >
  @import 'player.less';
</style>