import { PlayerPoints } from "./PlayerPoints";

export class GameTurn {
    prompt: string;
    playersCorrect: string[]
    points: PlayerPoints[];

    constructor(prompt: string) {
        this.prompt = prompt;
        this.playersCorrect = [];
        this.points = [];
    }
}