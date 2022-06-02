import { last } from "lodash-es";

const pattern = [5, 8, 13, 20, 35, 50, 75, 100];

export default class Neural {
  static level(index) {
    return pattern[index - 1];
  }

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
    const lastWagerIndex = pattern.findIndex(_ => _ === lastRound.wager);

    let wager;

    if (lastRound.won) {
      const level5 = Neural.level(5);
      /////////
      // WIN //
      /////////
      let level;

      // 1. if two consecutive wagers are won or if two out of three wagers are won the next wager is two levels lower
      if (rounds.length >= 3) {
        const last3Rounds = rounds.slice(-3);
        const level1 = Neural.level(1);

        if (last3Rounds.filter(_ => _?.won && (_?.wager === level1)).length === 3) {
          // up one level if won 3 times with level 1
          level = -1;
        } else if ((last3Rounds[1].wager >= level5 && last3Rounds[1].won) && lastRound.wager < level5) {
          level = 1;
        } else if (lastRound.wager > level5) {
          level = 2;
        } else if (last3Rounds.filter(_ => _?.won).length >= 2) {
          level = 2;
        } else {
          level = 1;
        }
      } else {
        // 2. the next wager will be one level lower
        level = 1;
      }

      wager = pattern[lastWagerIndex - level < 0 ? 0 : lastWagerIndex - level];
    } else {
      //////////
      // LOSE //
      //////////

      // the next wager will be on level higher
      wager = pattern[lastWagerIndex + 1 > rounds.length ? lastWagerIndex : lastWagerIndex + 1];
    }

    return wager;
  }
}