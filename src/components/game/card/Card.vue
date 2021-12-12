<template>
    <div class="card" :class="['figures-' + card.Figure, 'values-' + card.Value]">
		<h1>{{card.Value}}</h1> 
		<div class="figures" :class="card.Figure"></div>
		<h1>{{card.Value}}</h1>
	</div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { PropType } from 'vue';

import ICard from '../../models/ICard'; 

@Options({
  props: {
    card : {
      type : Object as PropType<ICard>
    }
  }
})
export default class Card extends Vue {}
</script>

<style scoped lang="less" >
  @import 'card.less';
</style>