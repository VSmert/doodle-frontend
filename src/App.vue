<template>
  <div id="app">
    <Table/>
  </div>
</template>

<script>
import Table from './components/game/table/Table.vue'

export default {
  name: 'App',
  components: {
    Table
  }
}
</script>

<style>
html, body{
	margin:0;
	padding:0;
}

#app {
	width:100vw;
	height:100vh;
}
</style>
