import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { PlayerCard } from '../components/PlayerList';
import { Button } from '@mui/material';
import GameDetails from '../models/GameDetails';

const { fetchGameDetails, fetchStartGame } = require('../data/ApiManager');

interface GameLobbyState {
  gameId: string;
  host: boolean;
  playerName: string;
}

export const GameLobby: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation();
  const { gameId, host, playerName } = location.state as GameLobbyState;
  const [gameDetails, setGameDetails] = useState(new GameDetails('', [], '', false));
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    getGameDetails()
   /* const timer = setInterval(() => getGameDetails(), 5000)

    return () => {
      clearInterval(timer);
    }*/
  }, [gameId])

  useEffect(() => {
    console.log("gameDetails effect" + gameId + " " + JSON.stringify(gameDetails) + " " + playerName)
    if (gameStarted) {
      navigate("/QuizMaster/game", { state: { gameId: gameId, playerName: playerName } })
    }
  }, [gameStarted])

  if (!gameId && !process.env.REACT_APP_DEMO) {
    navigate("/QuizMaster/")
    return <></>;
  }

  const getGameDetails = () => {
    console.log("fetch dets " + gameId + " " + JSON.stringify(gameDetails))
    fetchGameDetails(gameId, (gameDetails: GameDetails) => setGameDetails(gameDetails));
  }

  const onStartGameClicked = () => {
    console.log("Start game " + gameId)
    fetchStartGame(gameId, (gameDetails: GameDetails) => {
      console.log("start game callback" + gameId + " " + JSON.stringify(gameDetails))
      if (gameDetails.started) {
        setGameStarted(true);
      }
    })
  }

  return (
    <>
      <main>
        <h2>Quiz Master</h2>
        <h1>Join code: {gameDetails.joinCode}</h1>
        <div style={{ borderColor: '#000', borderWidth: 5, backgroundColor: '#BBB' }}>
          {gameDetails.players.map(player => <PlayerCard name={player} />)}
        </div>
      </main>
      <nav>
        <Button
          disabled={!host || gameDetails.players.length < 2}
          variant="contained"
          size="large"
          onClick={onStartGameClicked}
          style={{ marginRight: 10, height: 60 }}>
          Start Game
        </Button>
        <Button
          disabled={gameDetails.players.length < 2}
          variant="contained"
          size="medium"
          onClick={() => navigate("/QuizMaster/")}
          style={{ marginRight: 10, height: 60 }}>
          Back
        </Button>
      </nav>
    </>
  );
}