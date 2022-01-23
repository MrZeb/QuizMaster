import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DrawCanvas } from '../components/DrawFC';
import GameDetails from "../models/GameDetails";
import GameState from "../models/GameState";
import { TextField } from "@mui/material";
import { ChatMessage } from "../models/ChatMessage";
import { GamePhase } from "../models/GamePhase";
import { PlayerPoints } from "../models/PlayerPoints";

const { fetchGameDetails, subscribeGameDetails, subscribeGameState, subscribeActiveDrawing, submitChatMessage } = require('../data/ApiManager');

interface GameProps {
    gameId: string;
    playerName: string;
}

export const Game = () => {
    const location = useLocation();
    const { gameId, playerName } = location.state as GameProps;
    const [gameDetails, setGameDetails] = useState<GameDetails>();
    const [gameState, setGameState] = useState<GameState>();
    const [activeDrawing, setActiveDrawing] = useState('')
    const [currentInput, setCurrentInput] = useState('')
    const [turnTimeLeft, setTurnTimeLeft] = useState(-1)
    const [turnEndTime, setTurnEndTime] = useState(0);
    const [gamePhase, setGamePhase] = useState(GamePhase.NOT_STARTED)

    useEffect(() => {
        var unsubscribe = subscribeGameDetails(gameId, (gameDetails: GameDetails) => setGameDetails(gameDetails))
        return () => {
            unsubscribe();
        }
    }, [gameId])

    useEffect(() => {
        console.log("Sub game state " + JSON.stringify(gameDetails))
        if (!gameDetails || !gameDetails.id) {
            return;
        }

        console.log("!!!!!!")
        var unsubscribeGameState = subscribeGameState(gameDetails.id, (newGameState: GameState) => {
            console.log("Game state callback 1 " + JSON.stringify(gameState))
            setGameState(newGameState);
            console.log("Game state callback 2 " + JSON.stringify(gameState))
            setGamePhase(newGameState.phase);
        })

        var unsubscribeDrawings = subscribeActiveDrawing((drawing: string) => setActiveDrawing(drawing))

        return () => {
            unsubscribeGameState();
            unsubscribeDrawings();
        }
    }, [gameDetails])

    var countdownTimer: any;

    useEffect(() => {
        if (!gameState || gameState.phase !== GamePhase.ACTIVE_TURN) {
            clearInterval(countdownTimer);
            setTurnTimeLeft(-1);
            return;
        }

        countdownTimer = setInterval(() => {
            const diff = Math.floor((gameState.turnEndTime - new Date().getTime()) / 1000);

            console.log('Countdown end: ' + gameState.turnEndTime + " now: " + new Date().getTime() + " diff: " + diff)
            setTurnTimeLeft(diff);
        }, 1000)

        return () => {
            clearInterval(countdownTimer);
        }
    }, [gamePhase])

    const onKeyPressed = (event: any) => {
        console.log(`Pressed keyCode ${event.key} ${event.target.value}`);
        if (event.key === 'Enter') {
            event.preventDefault();

            const message = event.target.value;
            submitChatMessage(gameId, new ChatMessage(playerName, message), (response: string) => {
                console.log("Message sent successfully " + response)
            });
            setCurrentInput('');
        }
    }


    console.log('ROUNDS ? ' + JSON.stringify(gameState));
    if (!gameDetails || !gameState || !gameState.rounds || gameState.rounds.length <= 0) {
        // Not yet initialised
        return (<main>
            <div style={canvasStyles}>
                <h1>LOADING</h1>
            </div></main>
        )
    }

    const getCurrentTurn = () => gameState.rounds[gameState.round].turns[gameState.turn];

    const activePlayerName = gameDetails.players[gameState.turn];
    const myTurn = playerName === activePlayerName && (gamePhase === GamePhase.ACTIVE_TURN || gamePhase === GamePhase.PRE_TURN);

    const infoView = <div style={info}>
        <h2>{gamePhase}</h2>
        <h3>{gameDetails.id}</h3>
        <h3>Join code: {gameDetails.joinCode}</h3>
        <h1>Round: {gameState.round + 1}/{gameState.rounds?.length}</h1>
        <h2>Turn: {gameState.turn + 1}/{gameDetails.players.length}</h2>
        <h2>I am: {playerName}</h2>
        <h2>Player turn: {activePlayerName}</h2>
    </div>;

    const chatView = <div style={chat}>
        <div style={{ height: '94%', overflowY: 'auto', overscrollBehaviorY: 'contain', scrollSnapType: 'y proximity', overflowX: 'hidden', wordWrap: 'break-word' }}>
            {
                gameState.chatMessages.map((message, index) => {
                    let itemStyle: any = { margin: 1, fontSize: 14 };
                    if (index === gameState.chatMessages.length - 1) {
                        itemStyle.scrollSnapAlign = 'end';
                    }

                    if (message.sender === "System") {
                        itemStyle.color = '#00FF00';
                        itemStyle.fontWeight = 'bold';
                        return <p style={itemStyle}>{message.message}</p>;
                    }
                    return <p style={itemStyle}>{message.sender}: {message.message}</p>;
                }
                )
            }
        </div>
        <div style={{ backgroundColor: "#FFF", position: 'absolute', bottom: 2, left: 0, margin: 4 }}>
            <TextField size="small" value={currentInput} onChange={(event: any) => setCurrentInput(event.target.value)} onKeyPress={onKeyPressed} fullWidth style={chatInput} />
        </div>
    </div>

    const drawingView = <div style={{ zIndex: 1000 }}>
        <DrawCanvas enableDraw={myTurn} drawing={activeDrawing} />
    </div>

    const preTurnView = <div style={{ zIndex: 1000, width: 600, height: 600 }}>
        <h1>Next to draw: {gameDetails.players[gameState.turn]}</h1>
    </div>

    const turnResultsView = <div style={{ zIndex: 1000, width: 600, height: 600 }}>
        <h1>Turn Results</h1>
        {getCurrentTurn()?.points?.map((item, index) => <p>{index + 1}. {item.player} {item.points}</p>)}
    </div>

    console.log("Render " + JSON.stringify(gameState.totalPoints));
    const totalPointsView = gamePhase !== GamePhase.END_GAME ? <div style={{ zIndex: 1000, width: 240, height: 600 }}>
        <h1>Leaderboard</h1>
        {Array.from(gameState.totalPoints).map((item, index) => <p>{index + 1}. {item.player} {item.points}</p>)}
    </div> : null;

    const endGameView = <div style={{ zIndex: 1000, width: 600, height: 600, padding: 20 }}>
        <h1>Game over</h1>
        {gameState.totalPoints.map((item, index) => <p>{index + 1}. {item.player} {item.points}</p>)}
    </div>

    const currentView = () => {
        switch (gamePhase) {
            case GamePhase.NOT_STARTED: return <div><h1>Not Started</h1></div>;
            case GamePhase.PRE_TURN: return preTurnView;
            case GamePhase.ACTIVE_TURN: return drawingView;
            case GamePhase.POST_TURN: return turnResultsView;
            case GamePhase.END_GAME: return endGameView;
        }
    }

    const showPrompt = myTurn || gamePhase === GamePhase.POST_TURN;
    const showHint = gamePhase === GamePhase.ACTIVE_TURN;
    const prompt = getCurrentTurn().prompt;
    const hint = getCurrentTurn().hint;
    const promptView = <h1 style={{ display: "flex", justifyContent: "center", letterSpacing: '4px' }}>{showPrompt ? prompt : showHint ? hint : ''}</h1>

    const timeLeftText = gamePhase === GamePhase.ACTIVE_TURN ? `Time left: ${turnTimeLeft > 0 ? turnTimeLeft : ''}` : '';
    const countdownView = <h3 style={{ display: "flex", justifyContent: "center" }}>{timeLeftText}</h3>

    return (
        <>
            <main>
                <div style={canvasStyles}>
                    {infoView}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {promptView}
                        {countdownView}

                        <div style={gameContainer}>
                            {totalPointsView}
                            {currentView()}
                            {chatView}
                        </div>
                    </div>
                </div>
            </main>
            <nav>
                <Link to="/QuizMaster/">Home</Link>
            </nav>
        </>
    );
}

const info = {
    padding: 20,
}

const chatInput = {
    display: "flex",
    alignSelf: 'bottom',
    alignItems: 'bottom',
}

const points = {
    width: 200,
    height: 'auto',
    zIndex: 900,
    padding: 10,
}

const chat = {
    position: 'relative' as const,
    width: 240,
    height: '660',
    alignItems: "stretch",
    zIndex: 900,
}

const gameContainer = {
    padding: 10,
    display: "flex",
    height: 660,
    flexDirection: "row" as const,
    border: '1px solid #CCC',
}
const canvasStyles = {
    padding: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
}