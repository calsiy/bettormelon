export interface Round {
    index: number,
    wager: number,
    won: boolean,
    id: number
    bet: boolean
    betting: boolean
    margin: number
}

export interface Strategy {
    level(index: number): number;

    init({index, wager}: Round): Round;

    next(rounds: Array<Round>): number;
}