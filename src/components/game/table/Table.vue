<template>
  <div class="table">
    <div class="card-place">
			<Card v-for="(card, index) in five_cards" :key="index" :card="card"/>
		</div>
    <div class="players">
      <Player v-for="(player, index) in players" :key="index" class="player" :class="['player-' + (index + 1), {'playing': player_playing === index}]" :player="player"/>
    </div>
  </div>
</template> 
    
<script>  
import Card from '../card/Card.vue'; 
import Player from '../player/Player.vue'; 
  
export default {  
  name: 'Table',
  components: {Card, Player},
  data() {
		return {
      player_playing: 3,
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
        'S',
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
        'J',
        'Q',
        'K'
      ]
    }
	},
  computed: {
    cards () {
      let all = []
      for (let figure of this.figures) {
        for (let value of this.values) {
          all.push({
          figure: figure,
          value: value
          })
        }
      }
      return all
    },
    five_cards () {
      let fives = []
      for (let i = 0; i < 5; i++) {
        let drawAgain = true;
        let card;
        while (drawAgain) {
          let rand_id = parseInt(Math.random() * this.cards.length)
          card = this.cards[rand_id];
          drawAgain = fives.find(alreadyDrawnCard => alreadyDrawnCard.value === card.value && alreadyDrawnCard.figure === card.figure) !== undefined;
        }
        fives.push(card)
      }
      return fives
    }
  }
}
</script> 

<style scoped lang="less" >
  @import 'table.less';
</style>