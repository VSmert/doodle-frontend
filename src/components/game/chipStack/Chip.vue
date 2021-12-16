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
import { Options, Vue } from 'vue-class-component';

@Options({
    props: {
        denomination: Number,
        chipCount: Number,
    },
})
export default class Chip extends Vue {
    get nextChipTopPosition() {
        return (currentIndex: number) => -2 + currentIndex * 5;
    }
}
</script>

<style scoped lang="less">
@import 'chip.less';
</style>
