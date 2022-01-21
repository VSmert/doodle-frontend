<template>
    <div id="app">
        <Game @contextmenu.native="(e) => { e.preventDefault(); }"/>
    </div>
</template>

<script lang="ts">
import 'reflect-metadata'
import { Component, Vue } from "vue-property-decorator";
import Game from "./components/game/Game.vue";

@Component({
    components: {
        Game,
    },
})
export default class App extends Vue {
    isDevelopment = false;

    mounted(): void {
        this.isDevelopment = process.env.NODE_ENV === "development";
    }
}
</script>

<style lang="less">
@import "app.less";
</style>
