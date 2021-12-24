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
    components: {
    },
    props: {
        isPressable: Boolean
    },
    watch: {
        isPressable(value) {
        this._isPressable = value;
        }
    }
})
export default class Button extends Vue {
    private _isPressable = false;
    isPressed = false;

    setPressed(){
        if(this._isPressable)
            this.isPressed = true;
    }

    reset(){
        this.isPressed = false;
    }
}
</script>

<style scoped lang="less">
@import 'button.less';
</style>
