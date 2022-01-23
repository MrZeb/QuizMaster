import axios from "axios";
import GameDetails from "../models/GameDetails";
import db from "../data/StorageManager";
import GameState from "../models/GameState";
import { mockDrawing } from './mock_drawing';
import { ChatMessage } from "../models/ChatMessage";
import { GamePhase } from "../models/GamePhase";
import { GameRound } from "../models/GameRound";
import { GameTurn } from "../models/GameTurn";
import { PlayerPoints } from "../models/PlayerPoints";

const demo = process.env.REACT_APP_DEMO;
/*
const rounds: GameRound[] = [{
        turns: [
            new GameTurn("Pudge"),
            new GameTurn("Mirana"),
            new GameTurn("Boots of Elvenskin"),
        ]
    },
    {
        turns: [
            new GameTurn("Bloodseeker"),
            new GameTurn("Abaddon"),
            new GameTurn("Oblivion Staff"),
        ]
    }];
*/
const players =  ['Seb', 'Zeb', 'KonstigHest', 'Sebux'];
const defaultTotalPoints = players.map((player) => new PlayerPoints(player, 0));
const mockGameState = new GameState(GamePhase.NOT_STARTED, 5, 0, 0, 0, "Pudge", "_____", 10, [], 0, [], defaultTotalPoints);
const mockGameDetails = new GameDetails('123', players, '1234', 10, 3, mockGameState);

const gameDetailsCallbacks: { (result: GameDetails): any }[] = [];
const gameStateCallbacks: { (result: GameState): any }[] = [];

export const fetchHostGame = (playerName: string, callback: (result: GameDetails) => any) => {
    if (demo === "true") {
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
    if (demo === "true") {
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
    if (demo === "true") {
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

const postTurnTime = 5;
const preTurnTime = 5;

const startPreTurn = () => {
    mockGameState.phase = GamePhase.PRE_TURN;
    console.log('Create hint Pre ' + JSON.stringify(mockGameState.rounds[mockGameState.round]));
    console.log('Create hint ' + prompt + " -> " + mockGameState.hint);

    notifyGameStateListeners(mockGameState);

    console.log("Start Pre Turn " + preTurnTime);
    let timer = setInterval(() => {

        startTurn();
        clearInterval(timer);
        return () => {
            clearInterval(timer)
        }
    }, preTurnTime * 1000)
}

const startTurn = () => {
    mockGameState.phase = GamePhase.ACTIVE_TURN;
    mockGameState.turnEndTime = new Date().getTime() + mockGameDetails.turnTime * 1000;
    notifyGameStateListeners(mockGameState);
    console.log("Start Turn " + mockGameDetails.turnTime + " " + mockGameState.turnEndTime);
    let timer = setInterval(() => {
        endTurn();
        clearInterval(timer);
        return () => {
            clearInterval(timer)
        }
    }, mockGameDetails.turnTime * 1000)
}

const calculateTurnPoints = () => {
    const pointDistribution: number[] = Array.from({length: 20}, (_, i) => 20 - i * 2)
    const pointsList: PlayerPoints[] = [];

    for (let i=0; i<mockGameDetails.players.length; i++) {
        const player = mockGameDetails.players[i];
        const correctIndex = mockGameState.getCurrentTurn().playersCorrect.indexOf(player);
        const points = correctIndex >= 0 ? pointDistribution[correctIndex] : 0;
        pointsList.push(new PlayerPoints(player, points));
    }

    pointsList.sort((a, b) => b.points - a.points);

    mockGameState.getCurrentTurn().points = pointsList;

    // Add to total
    pointsList.forEach((playerPoints) => {
        const currentPoints = mockGameState.totalPoints.find((el) => el.player === playerPoints.player);

        if(!currentPoints) {
            mockGameState.totalPoints.push(new PlayerPoints(playerPoints.player, playerPoints.points));
        } else {
            currentPoints.points += playerPoints.points;
        }
    })
}

const endTurn = () => {
    mockGameState.phase = GamePhase.POST_TURN;
    calculateTurnPoints();
    notifyGameStateListeners(mockGameState);

    console.log("End Turn " + postTurnTime);
    let timer = setInterval(() => {

        console.log("End Turn interval pre if " + mockGameState.turn + " < " + mockGameDetails.players.length + " " + mockGameState.round + " < " + mockGameState.rounds.length);
        const increaseTurn = (mockGameState.turn + 1) < mockGameDetails.players.length;
        const increaseRound = (mockGameState.round + 1) < mockGameState.rounds.length;

        if (increaseTurn) {
            mockGameState.turn++;
            startPreTurn();
        } else if (increaseRound) {
            mockGameState.round++;
            mockGameState.turn = 0;
            startPreTurn();
        } else {
            endGame();
        }

        console.log("End Turn interval post if " + mockGameState.turn + " < " + mockGameDetails.players.length);

        clearInterval(timer);
        return () => {
            clearInterval(timer)
        }
    }, postTurnTime * 1000)
}

const endGame = () => {
    console.log("End Game");

    mockGameState.phase = GamePhase.END_GAME;
    notifyGameStateListeners(mockGameState);
}

const notifyGameStateListeners = (gameState: GameState) => {
    if (gameStateCallbacks && gameStateCallbacks.length > 0) {
        gameStateCallbacks.forEach((callback) => callback(gameState))
    }
}

const getRandomIndex = (max: number) => Math.floor(Math.random() * max);

export const fetchStartGame = (gameId: string, customWords: string[], callback: (result: GameDetails) => any) => {
    console.log("Start game. DEMO? " + demo)
    if (demo === "true") {
        const newGameDetails: GameDetails = mockGameDetails;

        if (gameDetailsCallbacks && gameDetailsCallbacks.length > 0) {
            gameDetailsCallbacks.forEach((callback) => callback(newGameDetails))
        }

        const numberOfWords = mockGameDetails.roundCount * mockGameDetails.players.length;
        const randomWords: string[] = [];

        for( let i=0; i < numberOfWords; i++) {
            let index = -1;
            let word = '';
            let tries = 0;

            do {
                index = getRandomIndex(customWords.length);
                word = customWords[index];
                console.log('Random word: ' + word + " " + tries)
                tries++;
            } while(randomWords.includes(word) && tries < 1000)
           
            if( tries >= 1000) {
                return;
            }

            randomWords.push(customWords[index])
        }

        const rounds: GameRound[] = [];
       
        for( let i=0; i<mockGameDetails.roundCount; i++ ){
            const turns = [];

            for( let p=0; p<mockGameDetails.players.length; p++) {
                const prompt = randomWords[i * p];
                const hint = prompt.split('').map((ch: string) => {
                    if (ch === ' ') {
                        return ' ';
                    } else {
                        return '_';
                    }
                }).join('');
                turns.push(new GameTurn(prompt, hint));
            }
            rounds.push(new GameRound(turns));
        }

        mockGameState.rounds = rounds;

        startPreTurn();

        callback(newGameDetails);
        return;
    }

    axios.post('/games/start', { gameId: gameId, roundCount: 3, customWords: customWords })
        .then((response) => {
            const game = response.data;

            console.log("game dets " + JSON.stringify(game))
            callback(game)
        })
        .catch((error) => {
            console.error(error);
        })
}

export const subscribeGameDetails = (gameId: string, callback: (gameDetails: GameDetails) => any) => {
    if (demo === "true") {
        callback(mockGameDetails);
        gameDetailsCallbacks.push(callback);
        return () => { };
    }

    return db.collection("games").doc(gameId)
        .onSnapshot((doc: any) => {
            console.log("SNAPSHOT GAME DETAILS " + JSON.stringify(doc.data()));

            const gameDetails = new GameDetails(
                doc.id,
                doc.data().players,
                doc.data().joinCode,
                doc.data().turnTime,
                doc.data().roundCount,
                doc.data().state
            )

            callback(gameDetails);
        });
}

export const subscribeGameState = (gameId: string, callback: (gameState: GameState) => any) => {
    if (demo === "true") {
        callback(mockGameState);
        gameStateCallbacks.push(callback);
        return () => { };
    }

    console.log("SUBSCRIBE GAME STATE " + gameId);
    return db.collection("games").doc(gameId)
        .onSnapshot((doc: any) => {
            console.log("SNAPSHOT GAME STATE " + JSON.stringify(doc.data()));
            callback(doc.data().state);
        });
}

export const subscribeActiveDrawing = (callback: (drawing: string) => any) => {
    if (demo === "true") {
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

const getCurrentTurn = () => mockGameState.rounds[mockGameState.round].turns[mockGameState.turn];

const correctAnswer = (player: string) => {
    const currentTurn = getCurrentTurn();
    currentTurn.playersCorrect.push(player);
}

export const submitChatMessage = (gameId: string, chatMessage: ChatMessage, callback: (result: string) => any) => {
    const sender = chatMessage.sender;
    const message = chatMessage.message;

    if (sender.length === 0 || message.length === 0) {
        return;
    }

    console.log("Submit chat message: " + chatMessage.sender + ": " + chatMessage)

    if (demo === "true") {
        let newChatMessage: ChatMessage;

        if (message.localeCompare(mockGameState.prompt, undefined, { sensitivity: 'accent' }) === 0) {
            newChatMessage = { sender: "System", message: `${sender} guessed correct answer!` }

            correctAnswer(sender);
        } else {
            newChatMessage = { sender: sender, message: message };
        }

        mockGameState.chatMessages.push(newChatMessage);

        if (gameStateCallbacks && gameStateCallbacks.length > 0) {
            gameStateCallbacks.forEach((callback) => callback(mockGameState))
        }

        return;
    }

    axios.post('/games/messages', { gameId: gameId, sender: sender, message: message })
        .then((response) => {
            console.log("Message sent " + JSON.stringify(response.data))
            callback(response.data)
        })
        .catch((error) => {
            console.error(error);
        })
}