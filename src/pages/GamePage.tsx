import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import GameSteps from '../components/gameSteps/GameSteps';
import { useToast } from '../hooks/useToast';
import Button from '../components/Button';
import { Card, Player } from '../api';

/**
 * Main game page that shows the current game state and handles game connection
 */
const GamePage: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();
  const { 
    game,
    playerId, 
    joinGame, 
    leaveGame, 
    loadGame, 
    isLoading, 
    error,
    clearError,
    resetGame
  } = useGameStore();
  const toast = useToast();

  // Load game data on mount
  useEffect(() => {
    if (!gameCode) {
      navigate('/');
      return;
    }

    const storedPlayerId = sessionStorage.getItem('playerId');
    const storedGameCode = sessionStorage.getItem('gameCode');
    
    // If we have a stored player ID, try to rejoin the game
    if (storedPlayerId && storedGameCode === gameCode) {
      loadGame(gameCode, storedPlayerId).catch((err: Error) => {
        // If loading fails, clear the player ID and show an error
        sessionStorage.removeItem('playerId');
        sessionStorage.removeItem('gameCode');
        toast.showError('Error al reconectar con el juego. Por favor, únete de nuevo.');
        navigate(`/join/${gameCode}`);
      });
    } else {
      // If no stored player ID, redirect to join page
      navigate(`/join/${gameCode}`);
    }

    // Clean up by leaving game when component unmounts
    return () => {
      if (gameCode && playerId) {
        // No abandonamos el juego automáticamente al salir de la página
        // para permitir reconexiones fáciles
      }
    };
  }, [gameCode, navigate]);

  // Handle leave game
  const handleLeaveGame = async () => {
    if (!gameCode || !playerId) return;
    
    try {
      await leaveGame(gameCode, playerId);
      sessionStorage.removeItem('playerId');
      sessionStorage.removeItem('gameCode');
      sessionStorage.removeItem('accessToken');
      // Pequeña pausa para asegurar que el estado se limpia completamente
      setTimeout(() => {
        resetGame(); // Aseguramos que el estado se limpia completamente
        navigate('/');
        toast.showSuccess('Has abandonado el juego');
      }, 100);
    } catch (err) {
      resetGame(); // También limpiamos el estado en caso de error
      toast.showError('Error al abandonar el juego');
      navigate('/');
    }
  };

  // Show loading state
  if (isLoading && !game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-lg">Cargando juego...</p>
      </div>
    );
  }

  // Show error state
  if (error && !game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-500/20 text-red-100 p-4 rounded-lg mb-6 max-w-md w-full text-center">
          <p className="text-lg font-medium mb-2">Error</p>
          <p>{error}</p>
        </div>
        <Button
          onClick={() => {
            clearError();
            navigate('/');
          }}
          className="bg-primary hover:bg-primary/80 text-white"
        >
          Volver a Inicio
        </Button>
      </div>
    );
  }

  // No game loaded
  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg mb-4">Juego no encontrado</p>
        <Button
          onClick={() => navigate('/')}
          className="bg-primary hover:bg-primary/80 text-white"
        >
          Volver a Inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Game header */}
      <header className="bg-gray-800 py-3 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Rixit</h1>
            <p className="text-sm text-gray-400">Código: {game.code}</p>
          </div>
          <Button
            onClick={handleLeaveGame}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm"
          >
            Abandonar Juego
          </Button>
        </div>
      </header>
      
      {/* Main game content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <GameSteps />
        </div>
      </main>
      
      {/* Player hand */}
      {game && game.stage !== 'lobby' && (
        <div className="bg-gray-900 p-4 border-t border-gray-800">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Tus cartas:</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {game.players.find((p: Player) => p.id === playerId)?.hand.map((card: Card) => (
                <div 
                  key={card.id} 
                  className="flex-shrink-0 w-24 h-36 rounded-md overflow-hidden border border-gray-700"
                >
                  <img 
                    src={`/cards/${card.id}.jpg`} 
                    alt="Card" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage; 