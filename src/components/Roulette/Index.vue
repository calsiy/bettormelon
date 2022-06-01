<script setup>
import { get, set } from "@vueuse/core";
import { last, map, sumBy } from "lodash-es";
import { computed, ref } from "vue";

const wagerPattern = [5, 8, 13, 20, 35, 50, 75, 100];

const initRound = (
    {
      index,
      wager
    }
) => ({
  index,
  wager,
  id: (new Date()).valueOf(),
  bet: false,
  betting: false,
  won: false
});

const btcFormatter = 0.0001;
const initWager = ref(5);
const rounds = ref([]);
const total = computed(() => sumBy(
    get(rounds).filter(_ => _?.bet), _ => _.won ? _.wager : _.wager * -1)
);
const totalBtc = computed(() => get(total) * btcFormatter);

const handleStartSession = () => {
  set(rounds, [initRound({
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

const generateNextRound = () => {
  const _rounds = get(rounds);
  const lastRound = last(_rounds);
  const lastWagerIndex = wagerPattern.findIndex(_ => _ === lastRound.wager);

  let wager;

  // lose
  if (!lastRound.won) {
    // the next wager wil be on level higher
    wager = wagerPattern[lastWagerIndex + 1 > _rounds.length ? _rounds.length : lastWagerIndex + 1];
  }

  // win
  if (lastRound.won) {
    // the next wager will be one level lower
    wager = wagerPattern[lastWagerIndex - 1 < 0 ? 0 : lastWagerIndex - 1];
  }

  // if two consecutive wagers are won
  // or if two out of three wagers are won
  // the next wager is two levels lower
  if (_rounds.length >= 3) {
    if (_rounds.slice(-3).filter(_ => _?.won).length >= 2) {
      wager = wagerPattern[lastWagerIndex - 2 < 0 ? 0 : lastWagerIndex - 2];
    }
  }

  set(rounds, [..._rounds, initRound({
    index: _rounds.length + 1,
    wager
  })]);
};

const handleSaveResult = (round, won) => {
  set(rounds, map(get(rounds), _ => _.id === round.id ? {
    ...round,
    betting: false,
    bet: true,
    won
  } : _));

  // generate next round's wager
  generateNextRound();
};

const handleReset = () => {
  set(rounds, []);
};

const handleExportToCsv = () => {
  const csvContent = "data:text/csv;charset=utf-8," +
      `Round,Wager,Result` +
      get(rounds).map(_ => `${_?.index},${_?.wager},${_?.won ? "Y" : "N"}`).join("\n") +
      `,${get(total)}\n`;

  const encodedUri = encodeURI(csvContent);

  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("target", "_blank");
  link.setAttribute("download", `roulette-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);

  link.click();
  link.remove();
};
</script>

<template>
  <div>
    <form @submit.prevent="handleStartSession">
      <input type="text" v-model="initWager">
      <button>Start</button>
    </form>

    <h1>
      <a :href="`https://www.google.com/search?q=${totalBtc}+btc+to+aud`" target="_blank">
        ${{ total }}
      </a>
    </h1>

    <table>
      <tr>
        <th>Round</th>
        <th>Wager</th>
        <th>Result</th>
        <th></th>
      </tr>

      <tr v-for="round of rounds" :key="round.id">
        <td>{{ round.index }}</td>
        <td>{{ round.wager }}</td>
        <td>{{ (!round.bet || round.betting) ? "-" : (round.won ? "&#128526" : "&#128545") }}</td>
        <td class="action">
          <button :disabled="round.bet" @click="handleBet(round)">
            &#128640
          </button>
          <span v-show="round.betting">
            <button @click="handleSaveResult(round, true)">&#128077</button>
            <button @click="handleSaveResult(round, false)">&#128078</button>
          </span>
        </td>
      </tr>
    </table>

    <button class="btn-reset" @click="handleReset">Reset</button>
    <hr>
    <button @click="handleExportToCsv">Export</button>
  </div>
</template>

<style scoped>
table {
  margin: 2rem auto 0;
}

table .action {
  min-width: 200px;
}

.btn-reset {
  margin-top: 3rem;
  display: inline-block;
}
</style>
