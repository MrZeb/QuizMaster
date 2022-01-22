import { useState } from 'react';
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CSS from 'csstype';
import GameDetails from '../models/GameDetails';
const { fetchHostGame, fetchJoinGame } = require('../data/ApiManager')

const MainStyles: CSS.Properties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent:'top',
    alignItems:'center',
    textAlign: 'center',
    height: '100vh'
}

const TextInput: CSS.Properties = {
    alignItems:"center",
    justifyContent: "top"
}

export function Home() {
    const navigate = useNavigate ()
    const [playerName, setPlayerName] = useState('')
    const [joinCode, setJoinCode] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const onChange = (name: string) => setPlayerName(name);
    const onChangeJoinCode = (joinCode: string) => setJoinCode(joinCode)

    console.log("DEMO? " + process.env.REACT_APP_DEMO)

    const handleHostClick = () => fetchHostGame(
        playerName,
        (gameDetails: GameDetails) => navigate("/QuizMaster/lobby", { state: { gameId: gameDetails.id, host: true, playerName: playerName } })
    );

    const handleJoinClick = () => fetchJoinGame(
        playerName,
        joinCode,
        (gameDetails: GameDetails | null, errorMessage?: string) => {
            console.log("JOIN CALLBACK " + JSON.stringify(gameDetails))
            if (errorMessage) {
                setErrorMessage(errorMessage);
            } else if (gameDetails) {
                navigate("/QuizMaster/lobby", { state: { gameId: gameDetails.id, host: false, playerName: playerName } });
            } else {
                setErrorMessage("Game details null!");
            }
        }
    )

    console.log("Error message " + errorMessage);
    return (
        <div style={MainStyles}>
            <main>
                <h2>Quiz Master</h2>
                <TextField
                    label="Player name"
                    variant="outlined"
                    margin="normal"
                    style={TextInput}
                    value={playerName}
                    onChange={(input) => onChange(input.target.value)}/>
            </main>
            <nav>
                <div style={{display: "flex", flexDirection: "row", justifyContent: "center"}}>
                    <Button
                        disabled={playerName.trim().length === 0}
                        variant="contained"
                        size="large"
                        onClick={handleHostClick}
                        style={{marginRight:10, height: 60}}>
                        Host game
                    </Button>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <Button
                            disabled={playerName.trim().length === 0 || joinCode.trim().length === 0}
                            variant="contained"
                            size="large"
                            onClick={handleJoinClick}
                            style={{height: 60}}>
                            Join game
                        </Button>
                        <TextField
                            label="Join code"
                            variant="outlined"
                            margin="dense"
                            style={TextInput}
                            value={joinCode}
                            onChange={(input) => onChangeJoinCode(input.target.value)}/>
                    </div>
                </div>
            </nav>
            <p>{errorMessage + ''}</p>
        </div>
    );
  }