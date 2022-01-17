import { useState, useEffect } from 'react';
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { PlayerCard } from '../components/PlayerList';
import { Button } from '@mui/material';
import GameDetails from '../models/GameDetails';

interface GameLobbyState {
  gameId: string;
  host: boolean;
  playerName: string;
}

export const GameLobby: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation();
  const { gameId, host, playerName } = location.state as GameLobbyState;
  const [gameDetails, setGameDetails] = useState(new GameDetails('',[],'', false));

  useEffect(() => {
    fetchGameDetails()
    const timer = setInterval(() => fetchGameDetails(), 5000)

    return () => {
        clearInterval(timer);
        }
  }, [gameId])

  useEffect(() => {
    if (gameDetails.started) {
      navigate("/game", { state: { gameId: gameId, playerName: playerName }})
    }
  }, [gameDetails])

  if (!gameId) {
    navigate("/")
    return <></>;
  }

  const fetchGameDetails = () => {
      console.log("fetch dets " + gameId + " " + JSON.stringify(gameDetails))
      axios.get(`/games/details?gameId=${gameId}`)
          .then((response) => {
              const game = response.data;

              console.log("game dets " + JSON.stringify(game))
              setGameDetails(game)
          })
          .catch((error) => {
              console.error(error);
          })
  }

  const onStartGameClicked = () => {
    console.log("Start game " + gameId)
      axios.get(`/games/start?gameId=${gameId}`)
          .then((response) => {
              const game = response.data;

              console.log("game dets " + JSON.stringify(game))
              setGameDetails(game)
          })
          .catch((error) => {
              console.error(error);
          })
  }

  return (
    <>
      <main>
        <h2>Quiz Master</h2>
        <h1>Join code: {gameDetails.joinCode}</h1>
      <div style={{borderColor:'#000', borderWidth: 5, backgroundColor: '#BBB'}}>
          {gameDetails.players.map(player => <PlayerCard name={player}/>)}
      </div>
      </main>
      <nav>
        <Button
            disabled={!host || gameDetails.players.length < 2}
            variant="contained"
            size="large"
            onClick={onStartGameClicked}
            style={{marginRight:10, height: 60}}>
            Start Game
        </Button>
        <Button
            disabled={gameDetails.players.length < 2}
            variant="contained"
            size="medium"
            onClick={() => navigate("/")}
            style={{marginRight:10, height: 60}}>
            Back
        </Button>
      </nav>
    </>
  );
}