import { ChatMessage } from "./ChatMessage";
import { GamePhase } from "./GamePhase";
import { GameRound } from "./GameRound";
import { PlayerPoints } from "./PlayerPoints";

export default class GameState {
    phase: GamePhase;
    numberOfPlayers: number;
    playerTurn: number;
    round: number;
    turn: number;
    prompt: string;
    hint: string;
    roundTimeLeft: number;
    chatMessages: ChatMessage[];
    turnEndTime: number;
    rounds: GameRound[];
    totalPoints: PlayerPoints[];

    constructor(
        phase: GamePhase,
        numberOfPlayers: number,
        playerTurn: number,
        round: number,
        turn: number,
        prompt: string,
        hint: string,
        roundTimeLeft: number,
        chatMessages: ChatMessage[],
        turnEndTime: number,
        rounds: GameRound[],
        totalPoints : PlayerPoints[]
    ) {
        this.phase = phase;
        this.numberOfPlayers = numberOfPlayers;
        this.playerTurn = playerTurn;
        this.round = round;
        this.turn = turn;
        this.prompt = prompt;
        this.hint = hint;
        this.roundTimeLeft = roundTimeLeft;
        this.chatMessages = chatMessages;
        this.turnEndTime = turnEndTime;
        this.rounds = rounds;
        this.totalPoints = totalPoints;
    }

    getCurrentTurn = () => this.rounds[this.round].turns[this.turn];
}