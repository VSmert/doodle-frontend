<template>
  <div id="app">
    <Table/>
  </div>
</template>

<script>
import Table from './components/game/Table.vue'

export default {
  name: 'App',
  components: {
    Table
  }
}
</script>

<style>
#app {
  margin-top: 60px;
}
</style>
