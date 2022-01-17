<template>
    <div class="card" :class="['figures-' + card.Figure, 'values-' + card.Value]">
        <h1>{{ card.Value }}</h1>
        <div class="figures" :class="card.Figure"></div>
        <h1>{{ card.Value }}</h1>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import ICard from "@/components/models/ICard";

@Component
export default class Card extends Vue {
    @Prop(Object) card!: ICard;
}
</script>

<style scoped lang="less">
@import "card.less";
</style>
