<template>
    <div>
        <div class="bank">
            <div class="bank-value">{{ player.bank - player.onTable }}</div>
            <div class="jetons v-10" v-if="(player.bank - player.onTable) / 10 >= 1"></div>
            <div class="jetons v-5" v-if="(player.bank - player.onTable) / 2 >= 1"></div>
            <div class="jetons v-1" v-if="(player.bank - player.onTable) >= 1"></div>
        </div>
        <div class="avatar" :style="{backgroundColor: player.color || 'dodgerblue'}"></div>
        <div class="name">{{player.name}}</div>
        <div class="mise">
            <div class="mise-value">
                {{ player.onTable }}
            </div>
            <div class="jeton-10" v-if="player.onTable / 10 >= 1">	
                <div class="jetons v-10" v-for="(n, i) in ((player.onTable - (player.onTable % 10)) / 10)" :key="i" :style="{top: (-2 + (i * 5)) + 'px'}"></div>
            </div>
            <div class="jeton-5" v-if="player.onTable % 10 && player.onTable % 10 >= 2">
                <div class="jetons v-5" v-for="(n, i) in (((player.onTable % 10) - ((player.onTable % 10) % 2)) / 2)" :key="i" :style="{top: (-2 + (i * 5)) + 'px'}"></div>
            </div>
            <div class="jeton-1">
                <div class="jetons v-1" v-if="player.onTable % 10 && player.onTable % 2"></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Player',
	props: {
		player: Object
	}
}
</script>