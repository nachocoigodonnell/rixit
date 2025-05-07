import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { useToast } from '../hooks/useToast';
import { useGameStore } from '../store/useGameStore';
import { Player } from '../api';

/**
 * Page for the game lobby where players wait for the game to start.
 */
const LobbyPage: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { game, error, isLoading, startRound, playerId } = useGameStore();
  
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
              <h2 className="text-2xl font-bold mb-4">Juego no encontrado</h2>
              <p className="mb-6">{error || "Código de juego inválido o sesión expirada"}</p>
              <Button 
                onClick={() => navigate('/join')}
                className="bg-secondary hover:bg-secondary/80 text-white"
              >
                Ir a Unirse
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  const player = game.players.find((p: Player) => p.id === playerId);
  const isHost = player?.isHost || false;
  
  if (!player) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Sesión Expirada</h2>
        <p className="mb-6">Tu sesión de jugador puede haber expirado.</p>
        <Button 
          onClick={() => navigate('/join')}
          className="bg-secondary hover:bg-secondary/80 text-white"
        >
          Ir a Unirse
        </Button>
      </div>
    );
  }
  
  const handleStartGame = async () => {
    if (!gameCode) return;
    
    try {
      await startRound(gameCode);
      toast.showSuccess('¡Juego iniciado!');
    } catch (error) {
      // Error already handled by the store
    }
  };
  
  const copyGameCode = () => {
    if (!gameCode) return;
    
    navigator.clipboard.writeText(gameCode);
    toast.showSuccess('¡Código de juego copiado al portapapeles!');
  };
  
  // Máximo de jugadores es 6
  const maxPlayers = 6;
  
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-4">Sala de Espera</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Código del Juego</h2>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-mono bg-gray-700 px-3 py-1 rounded">{game.code}</div>
              <button
                onClick={copyGameCode}
                className="text-gray-400 hover:text-white"
                title="Copiar código del juego"
              >
                📋
              </button>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-xl font-semibold mb-1">Jugadores</h2>
            <div className="text-2xl font-bold">{game.players.length} / {maxPlayers}</div>
          </div>
        </div>
        
        {isHost && (
          <div className="flex justify-center mb-8">
            <Button
              onClick={handleStartGame}
              disabled={isLoading || game.players.length < 3}
              className="bg-primary hover:bg-primary/80 text-white py-2 px-6 rounded disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin h-5 w-5 mr-2 border-2 border-t-transparent border-white rounded-full" />
                  Iniciando...
                </>
              ) : 'Iniciar Juego'}
            </Button>
          </div>
        )}
        
        {!isHost && (
          <p className="text-center mb-8 text-gray-300">
            Esperando a que el anfitrión inicie el juego...
          </p>
        )}
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Jugadores en la Sala</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {game.players.map((player: Player) => (
              <div 
                key={player.id}
                className={`bg-gray-700 rounded-lg p-3 flex items-center ${
                  player.isHost ? 'border-l-4 border-primary' : ''
                }`}
              >
                <div className="bg-gray-600 h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold mr-3">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{player.name}</div>
                  {player.isHost && (
                    <div className="text-xs text-primary">Anfitrión</div>
                  )}
                  {player.id === playerId && !player.isHost && (
                    <div className="text-xs text-secondary">Tú</div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Placeholder for remaining slots */}
            {Array.from({ length: maxPlayers - game.players.length }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-700/50 rounded-lg p-3 flex items-center opacity-40">
                <div className="bg-gray-600 h-10 w-10 rounded-full flex items-center justify-center text-lg mr-3">
                  ?
                </div>
                <div className="font-medium text-gray-400">Esperando jugador...</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="text-center text-gray-400 text-sm">
        <p>Necesitas al menos 3 jugadores para iniciar el juego.</p>
        <p>¡Comparte el código del juego con tus amigos para que se unan!</p>
      </div>
    </div>
  );
};

export default LobbyPage; 