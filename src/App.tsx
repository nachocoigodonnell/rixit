import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import CreateGamePage from './pages/CreateGamePage';
import JoinGamePage from './pages/JoinGamePage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';

const App: React.FC = () => (
  <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 relative">
    <main className="flex-1 p-4 container mx-auto w-full max-w-xl relative z-10">
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/create" element={<CreateGamePage />} />
        <Route path="/unirse" element={<JoinGamePage />} />
        <Route path="/join" element={<JoinGamePage />} />
        <Route path="/join/:gameCode" element={<JoinGamePage />} />
        <Route path="/lobby/:gameCode" element={<LobbyPage />} />
        <Route path="/game/:gameCode" element={<GamePage />} />
        {/* Otras rutas futuras */}
      </Routes>
    </main>

    <footer className="p-4 text-center text-xs text-gray-400 relative z-10">
      © 2025 Rixit
    </footer>
  </div>
);

export default App; 