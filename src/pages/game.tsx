import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DrawCanvas } from '../components/DrawFC';
import GameDetails from "../models/GameDetails";
import GameState from "../models/GameState";
import { TextField } from "@mui/material";
import { styled } from '@mui/material/styles';

const { fetchGameDetails, subscribeGameState, subscribeActiveDrawing, submitChatMessage }  = require('../data/ApiManager');

interface GameProps {
    gameId: string;
    playerName: string;
  }

export const Game = () => {
    const location = useLocation();
    const { gameId, playerName } = location.state as GameProps;
    const [gameDetails, setGameDetails] = useState(new GameDetails('',[],'', false));
    const [gameState, setGameState] = useState(new GameState(0,0,0,'','', 0, new Map<string, number>(), []));
    const [activeDrawing, setActiveDrawing] = useState('')
    const [currentInput, setCurrentInput] = useState('')

    useEffect(() => {
        fetchGameDetails(gameId, (gameDetails: GameDetails) => setGameDetails(gameDetails))
    }, [])

    useEffect(() => {
        let isMounted = true;
      
        var unsubscribeGameState = subscribeGameState("QfZbtcSjeLHLjQRAb8s7", (gameState: GameState ) => {
            console.log("Game state callback " + JSON.stringify(gameState))
            setGameState(gameState);
        })

        var unsubscribeDrawings = subscribeActiveDrawing((drawing: string ) => setActiveDrawing(drawing))

        return () => {
            isMounted = false;
            unsubscribeGameState();
            unsubscribeDrawings();
        }
    }, [gameDetails])

    const onKeyPressed = (event: any) => {
        console.log(`Pressed keyCode ${event.key} ${event.target.value}`);
        if (event.key === 'Enter') {
            event.preventDefault();
                
            const chatMessage = event.target.value;
            submitChatMessage(playerName, chatMessage);
            setCurrentInput('');
        }
    }
    
    const activePlayerName = gameDetails.players[gameState.playerTurn];
    const myTurn = playerName === activePlayerName;

    const pointsList: string[] = [];
    var index = 1;
    gameState.points.forEach((points, player) => {
        pointsList.push(`${index}. ${player}: ${points}\n`);
        index++;
    });
    
    console.log("Render " + JSON.stringify(gameState))

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
                        {pointsList.map((item) => <p>{item}</p>)}
                    </div>
                    <div style={{ zIndex: 1000 }}>
                        <DrawCanvas enableDraw={myTurn} drawing={activeDrawing}/> 
                    </div>
                    <div style={chat}>
                        <div style={{ height: '94%', overflowY: 'auto', overscrollBehaviorY: 'contain', scrollSnapType: 'y proximity', overflowX: 'hidden', wordWrap: 'break-word'}}>
                            {
                            gameState.chatMessages.map((message, index) => 
                                {
                                    let itemStyle: any = {margin: 1, fontSize: 14};
                                    if (index === gameState.chatMessages.length-1) {
                                        itemStyle.scrollSnapAlign = 'end';
                                    }
                                    return <p style={itemStyle}>{message.sender}: {message.message}</p>;
                                }
                            )
                            }
                        </div>
                        <div style={{backgroundColor: "#FFF", position: 'absolute', bottom: 2, left: 0, margin: 4}}>
                            <TextField size="small" value={currentInput} onChange={(event: any) => setCurrentInput(event.target.value)} onKeyPress={onKeyPressed} fullWidth style={chatInput}/>
                        </div>
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
    display: "flex",
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
    position: 'relative' as const,
    backgroundColor: '#FFFEAB',
    width: 200,
    height: '660',
    alignItems: "stretch",
    zIndex: 900,
    padding: 10,
}

const gameContainer = {
    display: "flex",
    height: 660,
    flexDirection: "row" as const,
    border: '1px solid #CCC',
}
const canvasStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
}