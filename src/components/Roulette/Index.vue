<script setup>
import { get, set } from "@vueuse/core";
import { last, map, sumBy } from "lodash-es";
import { computed, ref } from "vue";

const wagerPattern = [5, 8, 13, 20, 35, 50, 75, 100];
const chipValues = [
  0.00000001,
  0.0000001,
  0.000001,
  0.00001,
  0.0001
];
const chipValue = ref(0.00000001);

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

const initWager = ref(5);
const rounds = ref([]);
const total = computed(() => sumBy(
    get(rounds).filter(_ => _?.bet), _ => _.won ? _.wager : _.wager * -1)
);
const totalBtc = computed(() => get(total) * get(chipValue));

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

  if (lastRound.won) {
    /////////
    // win //
    /////////
    let level;

    // 1.
    // if two consecutive wagers are won
    // or if two out of three wagers are won
    // the next wager is two levels lower
    if (_rounds.length >= 3 && (_rounds.slice(-3).filter(_ => _?.won).length >= 2)) {
      level = 2;
    } else {
      // 2.
      // the next wager will be one level lower
      level = 1;
    }

    wager = wagerPattern[lastWagerIndex - level < 0 ? 0 : lastWagerIndex - level];
  } else {
    //////////
    // lose //
    //////////

    // the next wager wil be on level higher
    wager = wagerPattern[lastWagerIndex + 1 > _rounds.length ? _rounds.length : lastWagerIndex + 1];
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
      "Round,Wager,Result\n" +
      get(rounds).filter(_ => _?.bet).map(_ => `${_?.index},${_?.wager},${_?.won ? "Y" : "N"}`).join("\n") +
      `,,${get(total)}`;

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
    <section class="chip-value-wrapper">
      <label for="chip-value">Chip Value: </label>
      <select id="chip-value" v-model="chipValue">
        <option
            v-for="v of chipValues"
            :key="v"
            :value="v"
        >
          {{ v }}
        </option>
      </select>
    </section>

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
          <button :disabled="round.bet" @click="handleBet(round)">&#128640</button>
          <span v-show="round.betting">
            <button @click="handleSaveResult(round, true)">&#128077</button>
            <button @click="handleSaveResult(round, false)">&#128078</button>
          </span>
        </td>
      </tr>
    </table>

    <button class="btn-export" @click="handleExportToCsv">Export</button>
    <hr>
    <button class="btn-reset" @click="handleReset">Reset</button>
  </div>
</template>

<style scoped>
.chip-value-wrapper {
  margin-bottom: 1rem;
}

table {
  margin: 2rem auto 0;
}

table .action {
  min-width: 200px;
}

.btn-export {
  margin-top: 3rem;
}

.btn-reset {
  background-color: palevioletred;
  color: white;
  display: inline-block;
}
</style>
