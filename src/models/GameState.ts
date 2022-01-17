export default class GameState {
    numberOfPlayers: number;
    playerTurn: number;
    round: number;
    prompt: string;
    hint: string;
    roundTimeLeft: number;

    constructor(
        numberOfPlayers: number,
        playerTurn: number,
        round: number,
        prompt: string,
        hint: string,
        roundTimeLeft: number
    ) {
        this.numberOfPlayers = numberOfPlayers;
        this.playerTurn = playerTurn;
        this.round = round;
        this.prompt = prompt;
        this.hint = hint;
        this.roundTimeLeft = roundTimeLeft;
    }
}