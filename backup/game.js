Vue.component('card', {
	template: `<div class="card" :class="['figures-' + card.f, 'values-' + card.v]">
		<h1>{{card.v}}</h1>
		<div class="figures" :class="card.f"></div>
		<h1>{{card.v}}</h1>
	</div>`,
	props: ['card']
})

let app = new Vue({
	el: '.vue-container',
	data: {
		player_playing: 0,
		players: [
			{name:'rivy33', bank: 100, onTable: 77, hasCards: false},
			{name:'kattar', color: 'cyan', bank: 100, onTable: 20, hasCards: false},
			{name:'mikelaire', color: 'lightcoral', bank: 100, onTable: 20, hasCards: false},
			{name:'tomtom', color: 'crimson', bank: 100, onTable: 20, hasCards: false},
			{name:'nana', color: '#444', bank: 100, onTable: 20, hasCards: false},
			{name:'ionion', color: 'forestgreen', bank: 100, onTable: 20, hasCards: false},
			{name:'link6996', color: 'goldenrod', bank: 100, onTable: 20, hasCards: false},
			{name:'gossboganon', color: 'gold', bank: 100, onTable: 20, hasCards: false}
		],
		figures : [
			'P',
			'H',
			'C',
			'D'
		],
		values : [
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
			'8',
			'9',
			'10',
			'V',
			'D',
			'K'
		]
	},
	computed: {
		cards () {
			let all = []
			for (let figure of this.figures) {
				for (let value of this.values) {
					all.push({
						f: figure,
						v: value
					})
				}
			}
			return all
		},
		five_cards () {
			let fives = []
			for (let i = 0; i < 5; i++) {
				let rand_id = parseInt(Math.random() * this.cards.length)
				fives.push(this.cards[rand_id])
			}
			return fives
		}
	}
})