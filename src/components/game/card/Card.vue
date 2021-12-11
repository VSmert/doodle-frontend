<template>
    <div class="card" :class="['figures-' + card.figure, 'values-' + card.value]">
		<h1>{{card.value}}</h1> 
		<div class="figures" :class="card.figure"></div>
		<h1>{{card.value}}</h1>
	</div>
</template>

<script>
import { Options, Vue } from 'vue-class-component';

@Options({
  props: {
    card: Object
  }
})
export default class Card extends Vue {}
</script>

<style scoped lang="less" >
  @import 'card.less';
</style>