import axios from "axios";
import GameDetails from "../models/GameDetails";
import db from "../data/StorageManager";
import GameState from "../models/GameState";
import { mockDrawing } from './mock_drawing';
import { ChatMessage } from "../models/ChatMessage";

const demo = process.env.REACT_APP_DEMO;

const mockGameDetails = new GameDetails('123', ['KonstigHest', 'Sebux'], '1234', false);

const points = new Map<string, number>(mockGameDetails.players.map((player) => [player, 15]));

const mockGameState = new GameState(5, 0, 1, "Pudge", "_____", 90, points, []);

const gameStateCallbacks: { (result: GameState): any }[] = [];

export const fetchHostGame = (playerName: string, callback: (result: GameDetails) => any) => {
    if (demo) {
        callback(mockGameDetails);
        return;
    }

    axios.post('/games/host', { players: [playerName] })
        .then((response) => {
            console.log(response.data);
            const game = response.data;
            console.log("game dets from host " + JSON.stringify(game));
            callback(game);
        })
}

export const fetchJoinGame = (playerName: string, joinCode: string, callback: (result: GameDetails | null, error?: string) => any) => {
    if (demo) {
        callback(mockGameDetails);
        return;
    }

    axios.post("/games/join", { playerName: playerName, joinCode: joinCode })
        .then((response) => {
            const game = response.data;
            callback(game)
        })
        .catch((err) => {
            console.error(err);
            callback(null, err)
        })
}

export const fetchGameDetails = (gameId: string, callback: (result: GameDetails) => any) => {
    if (demo) {
        callback(mockGameDetails)
        return;
    }

    axios.get(`/games/details?gameId=${gameId}`)
        .then((response) => {
            const game = response.data;

            console.log("game dets " + JSON.stringify(game))
            callback(game)
        })
        .catch((error) => {
            console.error(error);
        })
}

export const fetchStartGame = (gameId: string, callback: (result: GameDetails) => any) => {
    console.log("Start game. DEMO? " + demo)
    if (demo) {
        const newGameDetails: GameDetails = mockGameDetails;
        newGameDetails.started = true;

        console.log("Start game. PRE CALLBACK")
        callback(newGameDetails);
        console.log("Start game. POST CALLBACK")
        return;
    }

    axios.get(`/games/start?gameId=${gameId}`)
        .then((response) => {
            const game = response.data;

            console.log("game dets " + JSON.stringify(game))
            callback(game)
        })
        .catch((error) => {
            console.error(error);
        })
}

export const subscribeGameState = (gameId: string, callback: (gameState: GameState) => any) => {
    if (demo) {
        callback(mockGameState);
        gameStateCallbacks.push(callback);
        return () => { };
    }

    return db.collection("games").doc(gameId)
        .onSnapshot((doc: any) => {
            console.log("SNAPSHOT GAME STATE");
            callback(doc.data().gameState);
        });
}

export const subscribeActiveDrawing = (callback: (drawing: string) => any) => {
    if (demo) {
        callback(mockDrawing);
        return () => { };
    }

    return db.collection("drawings")
        .orderBy("createdAt", "desc")
        .onSnapshot((querySnapshot) => {
            console.log("SNAPSHOT DRAWING");
            let savedDrawing = querySnapshot.docs[0].data().drawingData;
            if (!savedDrawing) { return; }
            callback(savedDrawing);
        });
}

export const submitChatMessage = (playerName: string, chatMessage: string) => {
    if (playerName.length === 0 || chatMessage.length === 0) {
        return;
    }

    console.log("Submit chat message: " + playerName + ": " + chatMessage)

    if (demo) {
        mockGameState.chatMessages.push(new ChatMessage(playerName, chatMessage));
        if (gameStateCallbacks && gameStateCallbacks.length > 0) {
            gameStateCallbacks.forEach((callback) => callback(mockGameState))
        }
    }

}