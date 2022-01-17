<template>
    <div v-if="chipCount > 0">
        <div
            :class="['chip', 'denomination-' + denomination]"
            v-for="index in chipCount"
            :key="index"
            :style="{ top: nextChipTopPosition(index) + 'px' }"
        ></div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Chip extends Vue {
    @Prop(Number) denomination!: number;
    @Prop(Number) chipCount!: number;

    get nextChipTopPosition() {
        return (currentIndex: number): number => -2 + currentIndex * 5;
    }
}
</script>

<style scoped lang="less">
@import "chip.less";
</style>
