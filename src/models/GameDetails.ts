export default class GameDetails {
    id: string;
    players: string[];
    joinCode: string;
    started: boolean;

    constructor(id: string, players: string[], joinCode: string, started: boolean) {
        this.id = id;
        this.players = players;
        this.joinCode = joinCode;
        this.started = started;
    }
}