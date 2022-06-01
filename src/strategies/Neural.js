import { last } from "lodash-es";

const wagerPattern = [5, 8, 13, 20, 35, 50, 75, 100];

export default class Neural {
  static init(
    {
      index,
      wager
    }
  ) {
    return {
      index,
      wager,
      id: (new Date()).valueOf(),
      bet: false,
      betting: false,
      won: false,
      margin: wager * -1
    };
  }

  static next(rounds) {
    const lastRound = last(rounds);
    const lastWagerIndex = wagerPattern.findIndex(_ => _ === lastRound.wager);

    let wager;

    if (lastRound.won) {
      /////////
      // WIN //
      /////////
      let level;

      // 1.
      // if two consecutive wagers are won
      // or if two out of three wagers are won
      // the next wager is two levels lower
      if (rounds.length >= 3) {
        const last3Rounds = rounds.slice(-3);

        if (last3Rounds[1].wager >= 50 && last3Rounds[2].wager < 50) {
          level = 1;
        } else if (last3Rounds[1].won && last3Rounds[2].won) {
          level = 1;
        } else if (lastRound.wager > 50) {
          level = 2;
        } else if (last3Rounds.filter(_ => _?.won).length >= 2) {
          level = 2;
        } else {
          level = 1;
        }
      } else {
        // 2.
        // the next wager will be one level lower
        level = 1;
      }

      wager = wagerPattern[lastWagerIndex - level < 0 ? 0 : lastWagerIndex - level];
    } else {
      //////////
      // LOSE //
      //////////

      // the next wager wil be on level higher
      wager = wagerPattern[lastWagerIndex + 1 > rounds.length ? lastWagerIndex : lastWagerIndex + 1];
    }

    return wager;
  }
}