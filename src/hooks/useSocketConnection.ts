import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Game } from '../api';
import { 
  initializeSocket, 
  disconnectSocket, 
  joinGameRoom, 
  onGameUpdate,
  getSocket
} from '../api/socketApi';

/**
 * Hook para gestionar la conexión de websocket y sincronizar
 * el estado del juego con la store de Zustand.
 */
export function useSocketConnection(gameCode?: string) {
  const { 
    setGame, 
    accessToken, 
    game,
    playerId 
  } = useGameStore();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const gameUpdateHandlerRef = useRef<((game: Game) => void) | null>(null);
  const socketInitializedRef = useRef(false);
  const connectionAttemptRef = useRef(false);

  useEffect(() => {
    // No intentar conectar si no hay token o código de juego
    if (!accessToken || !gameCode || connectionAttemptRef.current) {
      return;
    }

    const connectAndJoin = async () => {
      try {
        setIsConnecting(true);
        connectionAttemptRef.current = true;
        
        // Inicializar la conexión con el token
        const socket = initializeSocket(accessToken);
        socketInitializedRef.current = true;
        
        // Esperar a que el socket esté conectado
        if (!socket.connected) {
          await new Promise<void>((resolve) => {
            const onConnect = () => {
              socket.off('connect', onConnect);
              resolve();
            };
            socket.on('connect', onConnect);
          });
        }

        // Unirse a la sala siempre que tengamos un código de juego
        if (gameCode) {
          const currentPlayer = game?.players?.find(p => p.id === playerId);
          joinGameRoom(gameCode, currentPlayer?.name);
        }

        // Crear manejador para actualizar el estado cuando llegue game_update
        if (!gameUpdateHandlerRef.current) {
          gameUpdateHandlerRef.current = (updatedGame: Game) => {
            console.log('Actualizando estado del juego:', updatedGame);
            setGame(updatedGame);
          };
          
          // Registrar manejador
          onGameUpdate(gameUpdateHandlerRef.current);
        }
      } catch (error) {
        console.error('Error al configurar la conexión de socket:', error);
      } finally {
        setIsConnecting(false);
      }
    };

    connectAndJoin();

    // Limpieza al desmontar
    return () => {
      gameUpdateHandlerRef.current = null;
      socketInitializedRef.current = false;
      connectionAttemptRef.current = false;
    };
  }, [accessToken, gameCode, setGame, playerId]);

  return { 
    isConnected: !!accessToken && !!game,
    isConnecting
  };
} 