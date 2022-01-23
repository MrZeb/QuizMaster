import GameState from "./GameState";

export default class GameDetails {
    id: string;
    players: string[];
    joinCode: string;
    turnTime: number;
    roundCount: number;
    state: GameState;

    constructor(id: string, players: string[], joinCode: string, turnTime: number, roundCount: number, state: GameState) {
        this.id = id;
        this.players = players;
        this.joinCode = joinCode;
        this.turnTime = turnTime;
        this.roundCount = roundCount;
        this.state = state;
    }
}