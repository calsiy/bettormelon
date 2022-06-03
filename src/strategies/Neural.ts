// @ts-ignore
import {last} from "lodash-es";
import {Strategy, Round} from "./Strategy";

const pattern = [5, 8, 13, 20, 35, 50, 75, 100];

export default class Neural implements Strategy {
    level(index: number): number {
        return pattern[index - 1];
    }

    init(
        {
            index,
            wager
        }: Round
    ): Round {
        return {
            index: index,
            wager: wager,
            id: (new Date()).valueOf(),
            bet: false,
            betting: false,
            won: false,
            margin: wager * -1
        };
    }

    next(rounds: Array<Round>): number {
        const lastRound = last(rounds);
        const lastWagerIndex = pattern.findIndex(_ => _ === lastRound?.wager);

        let wager;

        if (lastRound?.won) {
            const level5 = this.level(5);
            /////////////////////////////////////////////////////////////////////////
            /// WIN ////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////
            let level;

            // 1. if two consecutive wagers are won or if two out of three wagers are won the next wager is two levels lower
            if (rounds.length >= 3) {
                const last3Rounds = rounds.slice(-3);

                if ((last3Rounds[1].wager >= level5 && last3Rounds[1].won) && lastRound.wager < level5) {
                    level = 1;
                } else if (lastRound.wager >= level5) {
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

            const nextWagerIndex = lastWagerIndex - level;
            wager = pattern[nextWagerIndex < 0 ? 0 : nextWagerIndex];
        } else {
            /////////////////////////////////////////////////////////////////////////
            /// LOSE ////////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////

            // the next wager will be on level higher
            const nextWagerIndex = lastWagerIndex + 1;
            wager = pattern[nextWagerIndex >= pattern.length ? lastWagerIndex : nextWagerIndex];
        }

        return wager;
    }
}