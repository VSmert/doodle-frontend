<template>
    <div class="buttonGroup">
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class ButtonGroup extends Vue {}
</script>

<style scoped lang="less">
@import "buttonGroup.less";
</style>
