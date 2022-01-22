import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { PlayerCard } from '../components/PlayerList';
import { Button, Card, CardContent, List, ListItem, Paper, TextField } from '@mui/material';
import GameDetails from '../models/GameDetails';

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
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    var unsubscribe = subscribeGameDetails(gameId, (gameDetails: GameDetails) => {
      console.log("game details callback!")
      setGameDetails(gameDetails);
      if (gameDetails.started) {
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
    if(!gameDetails) {return;}

    let words: string[] = wordString.split(',');
    words = words.map((word) => word.trim()).filter((word) => word.length > 0);

    console.log('wordstring ' + wordString + " " + wordString.length + '\n' + words);

      setCustomWords(words);
  }

  if (!gameDetails) {
    return <div><h1>GameDetails is null!!!</h1></div>
  }

  const findErrorsInCustomWords = (words: string[]) => {
    const wordsRequiredCount = gameDetails.players.length * gameDetails.roundCount;
    if(words.length < wordsRequiredCount) {
     return `There are ${words.length} ${words.length === 1 ? 'word' : 'words'}. Need at least ${wordsRequiredCount} words to fill all turns.`;
    } else {
     return '';
    }
  }

  const errorCustomWords = findErrorsInCustomWords(customWords);
  const customWordsError = errorCustomWords !== undefined && errorCustomWords.length > 0;

  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Paper elevation={4} sx={{ display: 'flex', flexDirection: 'column', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', margin: 20, padding: 20, width: 275,  minHeight: 200}}>
          <main>
            <h2>Quiz Master</h2>
            <h1>Join code: {gameDetails.joinCode}</h1>
            <div style={{border: '1px solid #BBB', borderRadius: 4}}>
              <List>
                {gameDetails.players.map(player => {
                  const playerEdited = host && player === playerName ? `${player} (Host)` : player;
                  return <ListItem sx={{fontWeight: 'bold', fontSize: 18}}>{playerEdited}</ListItem>}
                )}
              </List>
            </div>
            <div>
              <h2>Custom words</h2>
              <TextField fullWidth error={customWordsError} maxRows={4} multiline sx={{textOverflow: 'ellipsis' }} onChange={(input) => onWordsChange(input.target.value)}></TextField>
              <p>{errorCustomWords}</p>
            </div>
          </main>
          <nav>
            <div style={{marginBottom: 'auto', marginTop: 20}}>
              <Button
                variant="contained"
                size="medium"
                onClick={() => navigate("/QuizMaster/")}
                style={{ marginRight: 10, height: 60 }}>
                Back
              </Button>
              <Button
                disabled={!host || customWordsError}
                variant="contained"
                size="large"
                onClick={onStartGameClicked}
                style={{height: 60 }}>
                Start Game
              </Button>
            </div>
          </nav>
      </Paper>
    </div>
  );
}