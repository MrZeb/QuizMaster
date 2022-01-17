import { useState } from 'react';
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CSS from 'csstype';
import axios from 'axios';

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
    const [name, setName] = useState('')
    const [joinCode, setJoinCode] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const onChange = (name: string) => setName(name);
    const onChangeJoinCode = (joinCode: string) => setJoinCode(joinCode)

    const handleHostClick = () => {
        axios.post('/games/host', { players: [name] })
            .then((response) => {
                console.log(response.data);
                const game = response.data;
                console.log("game dets from host " + JSON.stringify(game))
                navigate("lobby", { state: { gameId: game.id, host: true } })
            })
    }

    const handleJoinClick = () => {
        axios.post("/games/join", { playerName: name, joinCode: joinCode })
            .then((response) => {
                const game = response.data;
                navigate("/lobby", { state: { playerName: name, gameId: game.id, host: false } })
            })
            .catch((err) => {
                console.error(err);
                setErrorMessage(err);
            })
    }

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
                    value={name}
                    onChange={(input) => onChange(input.target.value)}/>
            </main>
            <nav>
                <div style={{display: "flex", flexDirection: "row", justifyContent: "center"}}>
                    <Button
                        disabled={name.trim().length === 0}
                        variant="contained"
                        size="large"
                        onClick={handleHostClick}
                        style={{marginRight:10, height: 60}}>
                        Host game
                    </Button>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <Button
                            disabled={name.trim().length === 0 || joinCode.trim().length === 0}
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