import React, { useEffect, useState, useRef } from 'react';
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
  const [showContent, setShowContent] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [cardRotations, setCardRotations] = useState<Record<string, { x: number, y: number }>>({});

  // Efecto de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

  // Manejador para seleccionar una carta
  const handleCardSelect = (cardId: string) => {
    if (selectedCard === cardId) {
      setSelectedCard(null); // Deseleccionar si ya estaba seleccionada
    } else {
      setSelectedCard(cardId);
      // Efecto de vibración sutil con HapticFeedback si está disponible
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  // Función para manejar el efecto de tilting 3D de la carta
  const handleCardMove = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // posición X del mouse dentro de la carta
    const y = e.clientY - rect.top;  // posición Y del mouse dentro de la carta
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calcular ángulos de rotación con un máximo de 10 grados
    const rotateY = ((x - centerX) / centerX) * 10; // -10 a +10 grados en el eje Y
    const rotateX = ((centerY - y) / centerY) * 5;  // -5 a +5 grados en el eje X
    
    setCardRotations(prev => ({
      ...prev,
      [cardId]: { x: rotateX, y: rotateY }
    }));
  };
  
  // Función para resetear la rotación cuando el mouse sale de la carta
  const resetCardRotation = (cardId: string) => {
    setCardRotations(prev => ({
      ...prev,
      [cardId]: { x: 0, y: 0 }
    }));
    setHoveredCard(null);
  };

  // Show loading state
  if (isLoading && !game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full mb-6"></div>
        <p className="text-xl">Cargando juego...</p>
        <div className="mt-4 text-gray-400 text-sm animate-pulse">Por favor, espera un momento</div>
      </div>
    );
  }

  // Show error state
  if (error && !game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-md w-full text-center transform transition-all duration-700 ease-out">
          <div className="text-red-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl font-medium mb-2">Error</p>
          <p className="mb-6 text-gray-300">{error}</p>
          <Button
            onClick={() => {
              clearError();
              navigate('/');
            }}
            className="bg-primary hover:bg-primary/80 text-white transform transition-transform hover:scale-105"
          >
            Volver a Inicio
          </Button>
        </div>
      </div>
    );
  }

  // No game loaded
  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-md w-full text-center transform transition-all duration-700 ease-out">
          <p className="text-xl mb-6">Juego no encontrado</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-primary hover:bg-primary/80 text-white transform transition-transform hover:scale-105"
          >
            Volver a Inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Game header - completamente transparente */}
      <header className={`bg-transparent py-3 px-4 z-10 transition-all duration-700 transform ${showContent ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-3">
              <img src="/image/rixit-logo.png" alt="Rixit" className="h-8 w-auto" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Rixit
              </h1>
              <div className="flex items-center">
                <span className="text-sm text-gray-400">Código: </span>
                <span className="text-sm font-mono bg-gray-700/80 px-2 py-0.5 rounded ml-1">{game.code}</span>
              </div>
            </div>
          </div>
          <Button
            onClick={handleLeaveGame}
            className="bg-gray-700/50 hover:bg-gray-600/70 text-white text-sm backdrop-blur-sm transition-transform hover:scale-105"
          >
            Abandonar Juego
          </Button>
        </div>
      </header>
      
      {/* Main game content */}
      <main className={`flex-1 overflow-auto z-10 transition-all duration-700 ease-out delay-100 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <GameSteps />
        </div>
      </main>
      
      {/* Player hand */}
      {game && game.stage !== 'lobby' && (
        <div className={`bg-gray-900/50 backdrop-blur-sm p-4 border-t border-gray-800/30 z-10 transition-all duration-700 ease-out delay-200 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="max-w-7xl mx-auto">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Tus cartas:</h3>
            
            <div className="perspective-500 flex gap-3 overflow-x-auto pb-2 px-1">
              {game.players.find((p: Player) => p.id === playerId)?.hand.map((card: Card, index: number) => {
                const isSelected = selectedCard === card.id;
                const isHovered = hoveredCard === card.id;
                const rotation = cardRotations[card.id] || { x: 0, y: 0 };
                
                return (
                  <div 
                    key={card.id} 
                    className={`
                      flex-shrink-0 w-24 h-36 rounded-lg overflow-hidden
                      shadow-lg transition-all duration-300 cursor-pointer
                      ${isSelected ? 'ring-2 ring-primary shadow-lg shadow-primary/30 scale-110 z-20' : ''}
                      ${isHovered ? 'shadow-xl shadow-primary/20 z-10' : 'shadow-lg'}
                      ${!isSelected && !isHovered ? 'card-floating' : ''}
                    `}
                    style={{
                      transitionDelay: `${100 + index * 50}ms`,
                      transform: isSelected 
                        ? 'translateY(-15px) scale(1.05)'
                        : isHovered 
                          ? `translateY(-8px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
                          : 'translateY(0)',
                      animationDelay: `${index * 0.15}s`,
                      transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out'
                    }}
                    onClick={() => handleCardSelect(card.id)}
                    onMouseEnter={() => setHoveredCard(card.id)}
                    onMouseMove={(e) => handleCardMove(e, card.id)}
                    onMouseLeave={() => resetCardRotation(card.id)}
                  >
                    {/* Efecto de resplandor alrededor de la carta cuando está seleccionada */}
                    {isSelected && (
                      <div className="absolute -inset-1 bg-primary/20 rounded-lg blur-sm animate-pulse z-0"></div>
                    )}
                    
                    {/* Overlay de brillo superior cuando está seleccionada */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/10 animate-pulse z-10"></div>
                    )}
                    
                    <img 
                      src={`/cards/${card.id}.jpg`} 
                      alt="Card" 
                      className={`
                        w-full h-full object-cover transition-all duration-500 relative z-10
                        ${isHovered || isSelected ? 'scale-110 brightness-110' : 'scale-100'}
                      `}
                    />
                    
                    {/* Efecto de brillo en las esquinas */}
                    <div className={`
                      absolute inset-0 opacity-0 transition-opacity duration-300 z-20
                      bg-gradient-to-tr from-transparent via-white/0 to-primary/30
                      ${isHovered ? 'opacity-100' : ''}
                    `}></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage; 