import { GameRound } from "./GameRound";

export default class GameDetails {
    id: string;
    players: string[];
    joinCode: string;
    started: boolean;
    turnTime: number;
    roundCount: number;

    constructor(id: string, players: string[], joinCode: string, started: boolean, turnTime: number, roundCount: number) {
        this.id = id;
        this.players = players;
        this.joinCode = joinCode;
        this.started = started;
        this.turnTime = turnTime;
        this.roundCount = roundCount;
    }
}