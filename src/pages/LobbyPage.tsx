import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { useToast } from '../hooks/useToast';
import { useGameStore } from '../store/useGameStore';
import WaitingRoom from '../components/WaitingRoom';

/**
 * Page for the game lobby where players wait for the game to start.
 */
const LobbyPage: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();
  const { game, error, isLoading, loadGame } = useGameStore();
  
  useEffect(() => {
    // Cargar el juego si tenemos un código
    if (gameCode) {
      const playerId = sessionStorage.getItem('playerId') || '';
      loadGame(gameCode, playerId);
    }
  }, [gameCode, loadGame]);
  
  useEffect(() => {
    // Redirect to game page if the game stage is not lobby
    if (game && game.stage !== 'lobby') {
      navigate(`/game/${gameCode}`);
    }
  }, [game, gameCode, navigate]);
  
  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
              <p>Cargando sala de espera...</p>
            </div>
          ) : (
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Juego no encontrado
              </h2>
              <p className="mb-6">{error || "Código de juego inválido o sesión expirada"}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/join')}
                  className="bg-secondary hover:bg-secondary/80 text-white transition-all duration-300 transform hover:scale-105"
                >
                  Ir a Unirse
                </Button>
                <Button 
                  onClick={() => navigate('/create')}
                  className="bg-primary hover:bg-primary/80 text-white transition-all duration-300 transform hover:scale-105"
                >
                  Crear Partida
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Si el juego está en etapa lobby, mostramos la sala de espera
  return <WaitingRoom />;
};

export default LobbyPage; 