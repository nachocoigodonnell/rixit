import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import CreateGamePage from './pages/CreateGamePage';
import JoinGamePage from './pages/JoinGamePage';

const App: React.FC = () => (
  <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
    <main className="flex-1 p-4 container mx-auto w-full max-w-xl">
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/create" element={<CreateGamePage />} />
        <Route path="/unirse" element={<JoinGamePage />} />
        <Route path="/join" element={<JoinGamePage />} />
        {/* Otras rutas futuras */}
      </Routes>
    </main>

    <footer className="p-4 text-center text-xs text-gray-400">
      © 2025 Rixit
    </footer>
  </div>
);

export default App; 