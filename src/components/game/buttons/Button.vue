<template>
    <div class="button" :class="{'is-pressed': isPressed}" @mousedown.left="setPressed" @mouseup.left="reset" @mouseleave.left="reset">
        <div class="body">
            <div class="text"><slot></slot></div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
    props: {
        isPressable: {
            type: Boolean,
            default: true
        }
    }
})
export default class Button extends Vue {
    isPressable! : boolean;
    isPressed = false;

    setPressed(){
        if(this.isPressable)
        {
            this.isPressed = true;
            this.$emit('button-pressed')
        }
    }

    reset(){
        this.isPressed = false;
    }
}
</script>

<style scoped lang="less">
@import 'button.less';
</style>
