<template>
    <div>
        <div class="avatar" :style="{backgroundColor: player.color || 'dodgerblue'}"></div>
        <Bank :bankValue="player.bank" :bankOnTable="player.onTable" />
        <Bet :betOnTable="player.onTable"/>
        <div class="name">{{player.name}}</div>
    </div>
</template>

<script>
import Bank from './bank/Bank.vue'; 
import Bet from './bet/Bet.vue'; 

export default {
    name: 'Player',
    components: {Bank, Bet},
	props: {
		player: Object
	}
}
</script>

<style scoped lang="less" >
  @import 'player.less';
</style>