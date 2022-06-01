<script setup>
import { get, set } from "@vueuse/core";
import { map, sumBy } from "lodash-es";
import { computed, ref } from "vue";
import Neural from "../../strategies/Neural";

const level5 = Neural.level(5);

const chipValues = [
  0.00000001,
  0.0000001,
  0.000001,
  0.00001,
  0.0001
];
const selectedChip = ref(0.0001);

const coins = ["BTC", "LTC"];
const selectedCoin = ref("BTC");

const initWager = ref(5);
const rounds = ref([]);
const total = computed(() => sumBy(get(rounds).filter(_ => _?.bet), _ => _.margin));
const totalBtc = computed(() => get(total) * get(selectedChip));

const handleStartSession = () => {
  set(rounds, [Neural.init({
    index: 1,
    wager: get(initWager)
  })]);
};

const handleBet = round => {
  set(rounds, map(get(rounds), _ => _.id === round.id ? {
    ...round,
    betting: true,
    bet: true
  } : _));
};

const handleSaveResult = (round, won) => {
  set(rounds, map(get(rounds), _ => _.id === round.id ? {
    ...round,
    betting: false,
    bet: true,
    won,
    margin: won ? round.wager : round.wager * -1
  } : _));

  const _rounds = get(rounds);
  // generate next round's wager
  set(rounds, [..._rounds, Neural.init({
    index: _rounds.length + 1,
    wager: Neural.next(_rounds)
  })]);
};

const handleReset = () => {
  set(rounds, []);
};

const handleExportToCsv = () => {
  const csvContent = "data:text/csv;charset=utf-8," +
      "Round,Wager,Result\n" +
      get(rounds).filter(_ => _?.bet).map(_ => `${_?.index},${_?.wager},${_?.won ? "Y" : "N"}`).join("\n") +
      `,,${get(total)}`;

  const encodedUri = encodeURI(csvContent);

  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("target", "_blank");
  link.setAttribute("download", `roulette-${new Date().toISOString()}.csv`);
  document.body.appendChild(link);

  link.click();
  link.remove();
};
</script>

<template>
  <div>
    <section class="chip-value-wrapper">
      <label for="chip-value" style="padding-right: 15px;">Chip Value: </label>
      <select id="chip-value" v-model="selectedChip">
        <option v-for="v of chipValues" :key="v" :value="v">{{ v }}</option>
      </select>
      <select v-model="selectedCoin" style="margin-left: 15px;">
        <option v-for="c of coins" :key="c" :value="c">{{ c }}</option>
      </select>
    </section>

    <form @submit.prevent="handleStartSession">
      <input type="text" v-model="initWager" :disabled="rounds.length">
      <button :disabled="rounds.length">Start</button>
    </form>

    <header>
      <h1>
        <a
            :href="`https://www.google.com/search?q=${totalBtc}+${selectedCoin}+to+aud`"
            :style="{ 'text-decoration': 'none', color: `${total >= level5 ? 'green' : (total < 0 ? 'red' : 'inherit') }` }"
            target="_blank"
        >
          <b>${{ total }}</b>
        </a>
      </h1>
    </header>

    <table v-show="rounds.length">
      <tr>
        <th>Round</th>
        <th>Wager</th>
        <th>Result</th>
        <th></th>
      </tr>

      <tr
          v-for="round of rounds" :key="round.id"
          :style="{ 'background-color': (round.wager > level5 && !round.won) ? 'lightblue' : 'inherit' }"
      >
        <td>{{ round.index }}</td>
        <td :style="{ color: `${round.wager >= level5 ? 'red' : 'inherit' }` }">
          {{ round.wager }}
        </td>
        <td>{{ (!round.bet || round.betting) ? "-" : (round.won ? "&#128526" : "&#128545") }}</td>
        <td class="action">
          <button v-if="!round.bet" @click="handleBet(round)">&#128640</button>
          <template v-if="round.betting">
            <button @click="handleSaveResult(round, true)">&#128077</button>
            <button @click="handleSaveResult(round, false)">&#128078</button>
          </template>
        </td>
      </tr>
    </table>

    <button class="btn-export" @click="handleExportToCsv">Export</button>
    <button class="btn-reset" @click="handleReset">Reset</button>
  </div>
</template>

<style scoped>
select,
input {
  width: auto;
  display: inline-block;
}

.chip-value-wrapper {
  margin-bottom: 1rem;
}

table {
  margin: 2rem auto 0;
}

@media only screen and (max-width: 800px) {
  #app {
    margin-top: 10px !important;
  }

  h1 {
    padding: 0;
  }

  table {
    margin-top: 0;
  }
}

td, th {
  padding: 0.2rem;
  text-align: center;
}

table .action {
  display: flex;
  justify-content: space-evenly;
  min-width: 140px;
}

.btn-export,
.btn-reset {
  min-width: 75px;
}

.btn-export + .btn-reset {
  margin-left: 1rem;
}

.btn-reset {
  background-color: palevioletred;
  color: white;
  display: inline-block;
}
</style>
