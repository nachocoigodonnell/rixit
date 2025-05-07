import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { Player } from '../api';
import Button from './Button';
import { useToast } from '../hooks/useToast';

/**
 * Component that shows the waiting room screen before a game starts.
 * Players can see who has joined and the host can start the game when ready.
 */
const WaitingRoom: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const { game, playerId, startRound, isLoading, error, resetGame } = useGameStore();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  // Efecto de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!game) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const currentPlayer = game.players.find((p: Player) => p.id === playerId);
  const isHost = currentPlayer?.isHost || false;
  
  // Determine if we have enough players to start (3 or more)
  const canStart = game.players.length >= 3;

  const copyInviteLink = () => {
    const url = window.location.origin + '/join/' + game.code;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        toast.showSuccess('¡Enlace de invitación copiado al portapapeles!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.showError('Error al copiar el enlace');
      });
  };

  const handleStartGame = async () => {
    if (!gameCode) {
      toast.showError('Código de juego no encontrado');
      return;
    }

    if (!canStart) {
      toast.showError('Se necesitan al menos 3 jugadores para iniciar');
      return;
    }
    
    try {
      await startRound(gameCode);
      toast.showSuccess('¡Juego iniciado!');
      navigate(`/game/${gameCode}`);
    } catch (err) {
      // Error is shown by store, just add a toast
      toast.showError('Error al iniciar el juego');
    }
  };

  return (
    <div className="py-8 px-4 min-h-screen flex items-center justify-center overflow-hidden">
      <div className="relative z-10 max-w-2xl w-full mx-auto">
        <div className={`transition-all duration-700 ease-out transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Sala de Espera
          </h2>
          <h3 className="text-xl text-center mb-6">
            Código de juego: <span className="text-primary font-bold animate-pulse">{game.code}</span>
          </h3>
        </div>
        
        <div className={`mb-8 transition-all duration-700 ease-out delay-100 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex justify-center mb-4">
            <Button
              onClick={copyInviteLink}
              className={`bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300 transform hover:scale-105 ${copied ? 'bg-green-600 hover:bg-green-500' : ''}`}
            >
              {copied ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  ¡Copiado!
                </span>
              ) : 'Copiar enlace de invitación'}
            </Button>
          </div>
          
          <p className="text-center text-gray-400 text-sm mb-2">
            Comparte este enlace o código con amigos para que se unan
          </p>
          
          {isHost && (
            <div className="text-center text-sm text-gray-400">
              Como anfitrión, puedes iniciar el juego cuando todos se hayan unido
            </div>
          )}
        </div>
        
        <div className={`bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl transition-all duration-700 ease-out delay-200 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h4 className="font-medium mb-6 text-center text-xl">
            Jugadores <span className="inline-block px-2 py-1 bg-primary/20 rounded-full text-sm ml-2">{game.players.length}</span>
          </h4>
          <div className="space-y-3">
            {game.players.map((player: Player, index: number) => (
              <div 
                key={player.id} 
                className={`flex items-center justify-between p-4 rounded-xl transition-all duration-500 transform ${
                  showContent ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                } ${
                  player.id === playerId 
                    ? 'bg-primary/20 border border-primary/50 shadow-lg shadow-primary/20' 
                    : 'bg-gray-700/70 hover:bg-gray-700/90'
                }`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                <div className="flex items-center">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 transition-all duration-300 ${
                    player.isHost ? 'bg-secondary/40 text-white' : 'bg-primary/30'
                  }`}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-lg">
                      {player.name}
                      {player.id === playerId && <span className="ml-2 text-xs bg-primary/30 px-2 py-1 rounded-full">Tú</span>}
                    </div>
                    {player.isHost && (
                      <div className="text-sm text-secondary flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Anfitrión
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs bg-gray-600 hover:bg-gray-500 px-3 py-1.5 rounded-full transition-colors duration-300">
                  Listo
                </div>
              </div>
            ))}

            {/* Espacios vacíos para jugadores */}
            {Array.from({ length: Math.max(0, 6 - game.players.length) }).map((_, index) => (
              <div 
                key={`empty-${index}`}
                className={`flex items-center justify-center p-4 rounded-xl bg-gray-800/50 border border-dashed border-gray-700 transition-all duration-500 transform ${
                  showContent ? 'translate-x-0 opacity-60' : 'translate-x-10 opacity-0'
                }`}
                style={{ transitionDelay: `${200 + (game.players.length + index) * 100}ms` }}
              >
                <div className="text-gray-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Esperando jugador...
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {isHost && (
          <div className={`text-center transition-all duration-700 ease-out delay-300 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Button
              onClick={handleStartGame}
              disabled={isLoading || !canStart}
              className="bg-primary hover:bg-primary/80 text-white px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full mr-2" />
                  Iniciando juego...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Iniciar Juego
                </span>
              )}
            </Button>
            
            {!canStart && (
              <p className="mt-3 text-sm text-red-400 animate-pulse">
                Se necesitan al menos 3 jugadores para iniciar
              </p>
            )}
          </div>
        )}
        
        {!isHost && (
          <p className={`text-center text-gray-300 transition-all duration-700 ease-out delay-300 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <span className="animate-pulse inline-block mr-2">⌛</span>
            Esperando a que el anfitrión inicie el juego...
          </p>
        )}
        
        <div className={`text-center text-gray-400 text-sm mt-8 transition-all duration-700 ease-out delay-400 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl inline-block">
            <p>Necesitas al menos 3 jugadores para iniciar el juego.</p>
            <p>¡Comparte el código del juego con tus amigos para que se unan!</p>
          </div>
        </div>
        
        {/* Botón para volver */}
        <div className={`mt-6 text-center transition-all duration-700 ease-out delay-500 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem('playerId');
              sessionStorage.removeItem('gameCode');
              sessionStorage.removeItem('accessToken');
              resetGame();
              navigate('/');
            }}
            className="text-gray-400 hover:text-white flex items-center justify-center mx-auto transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a inicio
          </button>
        </div>
        
        {error && (
          <div className={`mt-4 p-3 bg-red-500/20 text-red-100 rounded-lg text-center transition-all duration-500 ease-out transform ${error ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {error}
          </div>
        )}
      </div>

      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"></div>
    </div>
  );
};

export default WaitingRoom; 