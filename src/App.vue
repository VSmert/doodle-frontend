<template>
    <Game @contextmenu.prevent />
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Game from './components/game/Game.vue';

@Options({
    components: {
        Game
    },
})
export default class App extends Vue {
    isDevelopment = false;
    mounted() {
        this.isDevelopment = process.env.NODE_ENV === "development"
    }
}
</script>

<style lang="less">
@import 'app.less';
</style>
