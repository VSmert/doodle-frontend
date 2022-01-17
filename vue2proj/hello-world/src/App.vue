<template>
    <div id="app">
        <Game @contextmenu.prevent />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Game from "./components/game/Game.vue";

@Component({
    components: {
        Game,
    },
})
export default class App extends Vue {
    @Prop(Boolean) isDevelopment = false;

    mounted(): void {
        this.isDevelopment = process.env.NODE_ENV === "development";
    }
}
</script>

<style lang="less">
@import "app.less";
</style>
