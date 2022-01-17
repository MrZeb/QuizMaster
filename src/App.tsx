import { Routes, Route } from "react-router-dom";
import './App.css';
import { Home } from './pages/home';
import { Game } from './pages/game';
import { GameLobby } from './pages/lobby';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/lobby" element={<GameLobby/>} />
      </Routes>
    </div>
  );
}

export default App;
