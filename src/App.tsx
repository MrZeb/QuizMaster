import { Routes, Route } from "react-router-dom";
import './App.css';
import { Home } from './pages/home';
import { Game } from './pages/game';
import { GameLobby } from './pages/lobby';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/QuizMaster/" element={<Home />} />
        <Route path="/QuizMaster/game" element={<Game />} />
        <Route path="/QuizMaster/lobby" element={<GameLobby/>} />
      </Routes>
    </div>
  );
}

export default App;
