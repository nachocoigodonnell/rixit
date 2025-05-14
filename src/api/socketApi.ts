/**
 * Socket.io API para comunicación en tiempo real con el servidor
 */
import { io, Socket } from 'socket.io-client';
import { Game } from '.';
import { config } from '../config';

// Configuración base (sin namespace)
const SOCKET_URL = config.socket.url;

let socket: Socket | null = null;

/**
 * Inicializa la conexión de socket con el token de autenticación
 * @param token Token JWT para autenticar la conexión
 * @returns La instancia del socket
 */
export function initializeSocket(token: string): Socket {
  console.log('Inicializando socket con URL:', SOCKET_URL);
  
  if (socket && socket.connected) {
    console.log('Socket ya conectado, reutilizando conexión');
    return socket;
  }

  // Si hay un socket existente pero desconectado, lo limpiamos
  if (socket) {
    console.log('Limpiando socket existente desconectado');
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
    ...config.socket.options,
  });

  // Manejadores de eventos base
  socket.on('connect', () => {
    console.log('Socket conectado!', socket?.id);
  });

  socket.on('connect_error', (err: Error) => {
    console.error('Error de conexión de socket:', err.message);
    console.error('Detalles del error:', err);
  });

  socket.on('disconnect', (reason: string) => {
    console.log('Socket desconectado:', reason);
  });

  socket.on('error', (err: Error) => {
    console.error('Error en socket:', err);
  });

  return socket;
}

/**
 * Obtiene la instancia actual del socket o lanza un error si no está conectado
 */
export function getSocket(): Socket {
  if (!socket) {
    throw new Error('Socket no inicializado. Llama a initializeSocket primero.');
  }
  if (!socket.connected) {
    throw new Error('Socket no conectado. Espera a que se establezca la conexión.');
  }
  return socket;
}

/**
 * Cierra la conexión del socket
 */
export function disconnectSocket(): void {
  if (socket) {
    console.log('Desconectando socket...');
    socket.disconnect();
    socket = null;
  }
}

/**
 * Unirse a una sala de juego
 * @param gameCode Código del juego
 * @param playerName Nombre del jugador (opcional)
 */
export function joinGameRoom(gameCode: string, playerName?: string): void {
  console.log('Intentando unirse a sala:', { gameCode, playerName });
  
  const socket = getSocket();
  socket.emit('join_game', { gameCode, playerName });
}

/**
 * Registra un manejador para las actualizaciones del juego
 * @param callback Función que se llamará cuando llegue un evento game_update
 */
export function onGameUpdate(callback: (game: Game) => void): void {
  if (!socket) {
    throw new Error('Socket no inicializado');
  }
  
  socket.on('game_update', callback);
}

/**
 * Inicia una ronda de juego (solo host)
 * @param gameCode Código del juego
 */
export function startRound(gameCode: string): void {
  if (!socket) {
    throw new Error('Socket no inicializado');
  }
  
  socket.emit('start_round', { gameCode });
}

/**
 * Envía pista y carta del narrador
 * @param gameCode Código del juego
 * @param narratorId ID del narrador
 * @param clue Pista dada
 * @param cardId ID de la carta seleccionada
 */
export function submitClue(gameCode: string, narratorId: string, clue: string, cardId: string): void {
  if (!socket) {
    throw new Error('Socket no inicializado');
  }
  
  socket.emit('submit_clue', { gameCode, narratorId, clue, cardId });
}

/**
 * Envía una carta como respuesta a la pista del narrador
 * @param gameCode Código del juego
 * @param playerId ID del jugador
 * @param cardId ID de la carta seleccionada
 */
export function submitCard(gameCode: string, playerId: string, cardId: string): void {
  if (!socket) {
    throw new Error('Socket no inicializado');
  }
  
  socket.emit('submit_card', { gameCode, playerId, cardId });
}

/**
 * Envía el voto de un jugador
 * @param gameCode Código del juego
 * @param voterId ID del votante
 * @param cardId ID de la carta votada
 */
export function voteCard(gameCode: string, voterId: string, cardId: string): void {
  if (!socket) {
    throw new Error('Socket no inicializado');
  }
  
  socket.emit('vote_card', { gameCode, voterId, cardId });
}

/**
 * Solicita revelar los resultados de la ronda
 * @param gameCode Código del juego
 */
export function revealRound(gameCode: string): void {
  if (!socket) {
    throw new Error('Socket no inicializado');
  }
  
  socket.emit('reveal_round', { gameCode });
}

/**
 * Salir del juego
 * @param gameCode Código del juego
 * @param playerId ID del jugador que sale
 */
export function leaveGame(gameCode: string, playerId: string): void {
  if (!socket) {
    console.warn('leaveGame: socket no inicializado, se ignora');
    return;
  }
  
  socket.emit('leave_game', { gameCode, playerId });
} 