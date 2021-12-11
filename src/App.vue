<template>
  <div id="app">
    <Table/>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Table from './components/game/table/Table.vue'

@Options({
  components: {
    Table,
  },
})
export default class App extends Vue {}
</script>

<style lang="less">
  @import 'app.less';
</style>
