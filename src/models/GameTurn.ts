import { PlayerPoints } from "./PlayerPoints";

export class GameTurn {
    prompt: string;
    playersCorrect: string[]
    points: PlayerPoints[];
    hint: string;

    constructor(prompt: string, hint: string) {
        this.prompt = prompt;
        this.hint = hint;
        this.playersCorrect = [];
        this.points = [];
    }
}