<template>
    <div class="card" :class="['figures-' + card.figure, 'values-' + card.value]">
		<h1>{{card.value}}</h1> 
		<div class="figures" :class="card.figure"></div>
		<h1>{{card.value}}</h1>
	</div>
</template>

<script>
export default {
    name: 'Card',
	props: {
		card: Object
	}
}
</script>