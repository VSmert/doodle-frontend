<template>
    <div class="bg" @contextmenu.prevent>
        <div id="app">
            <Table />
            <ButtonGroup class="left">
                <Button class="purple">Request play IOTA</Button>
            </ButtonGroup>
            <ButtonGroup class="right">
                <Button class="red">Leave table</Button>
                <Button class="green">Join next hand</Button>
                <Button class="green">Join next big blind</Button>
            </ButtonGroup>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Table from './components/game/table/Table.vue';
import ButtonGroup from './components/game/buttons/ButtonGroup.vue';
import Button from './components/game/buttons/Button.vue';

@Options({
    components: {
        Table,
        ButtonGroup,
        Button
    },
})
export default class App extends Vue {}
</script>

<style lang="less">
@import 'app.less';
</style>
