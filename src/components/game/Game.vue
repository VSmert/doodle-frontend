<template>
    <div class="bg">
        <div id="game">
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
import Table from './table/Table.vue';
import ButtonGroup from './buttons/ButtonGroup.vue';
import Button from './buttons/Button.vue';

@Options({
    components: {
        Table,
        ButtonGroup,
        Button
    },
})
export default class Game extends Vue {}
</script>

<style lang="less">
@import 'game.less';
</style>
