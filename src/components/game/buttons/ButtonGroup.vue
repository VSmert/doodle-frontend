<template>
    <div class="buttonGroup">
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
    components: {
    },
})
export default class ButtonGroup extends Vue {

}
</script>

<style scoped lang="less">
@import 'buttonGroup.less';
</style>
