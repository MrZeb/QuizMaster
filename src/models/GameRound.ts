import { GameTurn } from "./GameTurn";

export class GameRound {
    turns: GameTurn[]

    constructor(turns: GameTurn[]) {
        this.turns = turns;
    }
}