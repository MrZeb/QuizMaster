import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DrawCanvas } from '../components/DrawFC';
import GameDetails from "../models/GameDetails";
import GameState from "../models/GameState";
import { TextField } from "@mui/material";

const { fetchGameDetails, subscribeGameState, subscribeActiveDrawing }  = require('../data/ApiManager');

interface GameProps {
    gameId: string;
    playerName: string;
  }

export const Game = () => {
    const location = useLocation();
    const { gameId, playerName } = location.state as GameProps;
    const [gameDetails, setGameDetails] = useState(new GameDetails('',[],'', false));
    const [gameState, setGameState] = useState(new GameState(0,0,0,'','', 0));
    const [activeDrawing, setActiveDrawing] = useState('')

    useEffect(() => {
        fetchGameDetails(gameId, (gameDetails: GameDetails) => setGameDetails(gameDetails))
    }, [])

    useEffect(() => {
        let isMounted = true;
      
        var unsubscribeGameState = subscribeGameState("QfZbtcSjeLHLjQRAb8s7", (gameState: GameState ) => setGameState(gameState))
        var unsubscribeDrawings = subscribeActiveDrawing((drawing: string ) => setActiveDrawing(drawing))

        return () => {
            isMounted = false;
            unsubscribeGameState();
            unsubscribeDrawings();
        }
    }, [gameDetails])


    class ChatMessage {
        sender: string;
        message: string;

        constructor(sender: string, message: string) {
            this.sender = sender;
            this.message = message;
        }
    }

    const chatMessages = [
        new ChatMessage("Sebux", "pudge"),
        new ChatMessage("Sebux", "mirana"),
        new ChatMessage("Sebux", "visage"),
        new ChatMessage("Sebux", "pugna")
    ]

    const activePlayerName = gameDetails.players[gameState.playerTurn];
    const myTurn = playerName === activePlayerName;

    return (
        <>
        <main>
            <h1>Round: {gameState.round}</h1>
            <h2>I am: {playerName}</h2>
            <h2>Player turn: {activePlayerName}</h2>
            <h1 style={{display: "flex", justifyContent: "center"}}>{myTurn ? gameState.prompt : gameState.hint.split('').join(' ')}</h1>
            <h3 style={{display: "flex", justifyContent: "center"}}>Time left: {gameState.roundTimeLeft}</h3>
            <div style={canvasStyles}>
                <div style={gameContainer}>
                    <div style={points}>
                        {gameDetails.players.map((player, index) => <p>{index+1}. {player} 10 points</p>)}
                    </div>
                    <div style={{ zIndex: 1000 }}>
                        <DrawCanvas enableDraw={myTurn} drawing={activeDrawing}/> 
                    </div>
                    <div style={chat}>
                        <div style={{display: "flex", flexDirection: "column", height: "90%"}}>
                            {chatMessages.map((message) => <p style={{margin: 1, fontSize: 14}}>{message.sender}: {message.message}</p>)}
                        </div>
                        <TextField style={chatInput}></TextField>
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

const chatInput = {
    alignSelf: 'bottom',
    alignItems: 'bottom',
}

const points = {
    backgroundColor: '#FFFEAB',
    width: 200,
    height: 'auto',
    zIndex: 900,
    padding: 10,
}

const chat = {
    backgroundColor: '#FFFEAB',
    width: 200,
    height: 'auto',
    zIndex: 900,
    padding: 10,
}

const gameContainer = {
    display: "flex",
    flexDirection: "row" as const,
    border: '1px solid #CCC',
}
const canvasStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
}