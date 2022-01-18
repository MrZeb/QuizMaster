import { ChatMessage } from "./ChatMessage";

export default class GameState {
    numberOfPlayers: number;
    playerTurn: number;
    round: number;
    prompt: string;
    hint: string;
    roundTimeLeft: number;
    points: Map<string, number>;
    chatMessages: ChatMessage[];

    constructor(
        numberOfPlayers: number,
        playerTurn: number,
        round: number,
        prompt: string,
        hint: string,
        roundTimeLeft: number,
        points: Map<string, number>,
        chatMessages: ChatMessage[]
    ) {
        this.numberOfPlayers = numberOfPlayers;
        this.playerTurn = playerTurn;
        this.round = round;
        this.prompt = prompt;
        this.hint = hint;
        this.roundTimeLeft = roundTimeLeft;
        this.points = points;
        this.chatMessages = chatMessages;
    }
}