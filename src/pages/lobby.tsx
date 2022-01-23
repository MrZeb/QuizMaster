import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { PlayerCard } from '../components/PlayerList';
import { Button, Card, CardContent, List, ListItem, Paper, TextField } from '@mui/material';
import GameDetails from '../models/GameDetails';
import { GamePhase } from '../models/GamePhase';

const { fetchGameDetails, subscribeGameDetails, fetchStartGame } = require('../data/ApiManager');

interface GameLobbyState {
  gameId: string;
  host: boolean;
  playerName: string;
}

export const GameLobby: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId, host, playerName } = location.state as GameLobbyState;
  const [gameDetails, setGameDetails] = useState<GameDetails>();
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [roundCount, setRoundCount] = useState<number>(3);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    var unsubscribe = subscribeGameDetails(gameId, (gameDetails: GameDetails) => {
      console.log("game details callback! " + gameDetails.state)
      setGameDetails(gameDetails);
      if (gameDetails.state && gameDetails.state.phase &&  gameDetails.state.phase !== GamePhase.NOT_STARTED) {
        setGameStarted(true);
      }
    });

    return () => {
      unsubscribe();
    }
  }, [gameId])

  useEffect(() => {
    console.log("gameDetails effect" + gameId + " " + JSON.stringify(gameDetails) + " " + playerName)
    if (gameStarted) {
      navigate("/QuizMaster/game", { state: { gameId: gameId, playerName: playerName, customWords: customWords } })
    }
  }, [gameStarted])

  if (!gameId && !process.env.REACT_APP_DEMO) {
    navigate("/QuizMaster/")
    return <></>;
  }


  const onStartGameClicked = () => {
    console.log("Start game " + gameId)
    fetchStartGame(gameId, customWords, (gameDetails: GameDetails) => {
      console.log("start game callback" + gameId + " " + JSON.stringify(gameDetails))
    })
  }

  const onWordsChange = (wordString: string) => {
    if (!gameDetails) { return; }

    let words: string[] = wordString.split(',');
    words = words.map((word) => word.trim()).filter((word) => word.length > 0);

    console.log('wordstring ' + wordString + " " + wordString.length + '\n' + words);

    setCustomWords(words);
  }

  const onRoundCountChanged = (roundCount: string) => {
    setRoundCount(parseInt(roundCount));
  }

  if (!gameDetails) {
    return <div><h1>LOADING</h1></div>
  }

  const findErrorsInCustomWords = (words: string[]) => {
    const wordsRequiredCount = gameDetails.players.length * roundCount;
    console.log('Errors in words ' + words + '\n' + wordsRequiredCount);
    if (words.length < wordsRequiredCount) {
      return `${words.length} ${words.length === 1 ? 'word' : 'words'}. Need at least ${wordsRequiredCount} words to fill all turns.`;
    } else {
      return '';
    }
  }

  const errorMessage = findErrorsInCustomWords(customWords) ? findErrorsInCustomWords(customWords) : gameDetails.players.length < 3 ? 'Need at least 3 players.' : '';
  const customWordsError = errorMessage !== undefined && errorMessage.length > 0;

  const editView = <>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <h3 style={{ marginRight: 20 }}>Rounds:</h3>
      <TextField value={roundCount} size={'small'} onChange={(input) => onRoundCountChanged(input.target.value)}></TextField>
    </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h3 style={{ marginRight: 20 }}>Custom words:</h3>
        <TextField error={customWordsError} size={'small'} maxRows={4} multiline sx={{ textOverflow: 'ellipsis' }} onChange={(input) => onWordsChange(input.target.value)}></TextField>
      </div>
      <p>{errorMessage}</p>
  </>

  return (
    <div style={{ display: 'flex', width: '100%', backgroundColor: '#FF0099', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
      <main>
        <h2>Quiz Master</h2>
        <h1>Join code: {gameDetails.joinCode}</h1>
        <div style={{ border: '1px solid #BBB', borderRadius: 4, marginBottom: 20 }}>
          <List>
            {gameDetails.players.map(player => {
              const playerEdited = host && player === playerName ? `${player} (Host)` : player;
              return <ListItem key={player} sx={{ fontWeight: 'bold', fontSize: 18 }}>{playerEdited}</ListItem>
            }
            )}
          </List>
        </div>
        {host && editView}
      </main>
      <nav>
        <div style={{ marginBottom: 'auto', marginTop: 20 }}>
          <Button
            variant="contained"
            size="medium"
            onClick={() => navigate("/QuizMaster/")}
            style={{ marginRight: 10, height: 60 }}>
            Back
          </Button>
          {host &&
            <Button
              //disabled={gameDetails.players.length < 3 || customWordsError}
              variant="contained"
              size="large"
              onClick={onStartGameClicked}
              style={{ height: 60 }}>
              Start Game
            </Button>
          }
        </div>
      </nav>
    </div>
  );
}