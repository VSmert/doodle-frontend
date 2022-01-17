<template>
    <div class="button" :class="{ 'is-pressed': isPressed }" @mousedown.left="setPressed" @mouseup.left="reset" @mouseleave.left="reset">
        <div class="body">
            <div class="text"><slot></slot></div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
    props: {
        isPressable: {
            type: Boolean,
            default: true,
        },
    },
})
export default class Button extends Vue {
    @Prop(Boolean) isPressable!: boolean;
    @Prop(Boolean) isPressed = false;

    setPressed(): void {
        if (this.isPressable) {
            this.isPressed = true;
            this.$emit("button-pressed");
        }
    }

    reset(): void {
        this.isPressed = false;
    }
}
</script>

<style scoped lang="less">
@import "button.less";
</style>
