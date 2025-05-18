/**
 * API wrapper layer for Rixit game
 * This module connects the frontend with the mock backend.
 * When the real backend is ready, replace with actual API calls.
 */

import { 
  Card,
  Player,
  Submission,
  Vote,
  GameStage,
} from './mockServer';

import { config } from '../config';


/**
 * Creates a new game with the specified player name and player count
 */
export async function createGame(playerName: string, playerCount: number) {
  const response = await fetch(`${config.api.baseUrl}${config.api.endpoints.createGame}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerName, playerCount }),
  });

  if (!response.ok) {
    throw new Error('Failed to create game');
  }

  return response.json();
  
}

/**
 * Joins an existing game with the specified game code and player name
 */
export async function joinGame(gameCode: string, playerName: string) {
  const url = `${config.api.baseUrl}${config.api.endpoints.joinGame(gameCode)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerName }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to join game');
  }

  return response.json();
}

/**
 * Starts a new round in the game (from lobby)
 */
export async function startRound(gameCode: string) {
  const url = `${config.api.baseUrl}${config.api.endpoints.startGame(gameCode)}`;
  
  // Obtener el token de autenticación (necesario para este endpoint protegido)
  const accessToken = sessionStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No hay sesión activa');
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Error al iniciar la ronda');
  }

  return response.json();
}

/**
 * Submits the narrator's clue and card
 */
export async function submitClue(gameCode: string, playerId: string, clue: string, cardId: string) {
  const url = `${config.api.baseUrl}${config.api.endpoints.submitClue(gameCode)}`;
  
  // Obtener el token de autenticación (necesario para este endpoint protegido)
  const accessToken = sessionStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No hay sesión activa');
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ playerId, clue, cardId })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Error al enviar pista y carta');
  }

  return response.json();
}

/**
 * Submits a player's card based on the clue
 */
export async function submitCard(gameCode: string, playerId: string, cardId: string) {
  const url = `${config.api.baseUrl}${config.api.endpoints.submitCard(gameCode)}`;
  
  // Obtener el token de autenticación
  const accessToken = sessionStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No hay sesión activa');
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ playerId, cardId })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Error al enviar carta');
  }

  return response.json();
}

/**
 * Casts a player's vote for a card
 */
export async function voteCard(gameCode: string, voterId: string, cardId: string) {
  const url = `${config.api.baseUrl}${config.api.endpoints.voteCard(gameCode)}`;
  
  // Obtener el token de autenticación
  const accessToken = sessionStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No hay sesión activa');
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ voterId, cardId })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Error al votar por una carta');
  }

  return response.json();
}

/**
 * Processes the end of a round and advances the game
 */
export async function revealRound(gameCode: string) {
  const url = `${config.api.baseUrl}${config.api.endpoints.revealRound(gameCode)}`;
  
  // Obtener el token de autenticación
  const accessToken = sessionStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No hay sesión activa');
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Error al revelar ronda');
  }

  return response.json();
}

export async function getGame(gameCode: string) {
  const url = `${config.api.baseUrl}${config.api.endpoints.gameByCode(gameCode)}`;
  
  // Obtener el token de autenticación para enviarlo en la petición
  const accessToken = sessionStorage.getItem('accessToken');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  
  // Añadir token si existe
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to load game');
  }
  
  // La API ahora devuelve { game, myHand } pero nuestro frontend solo espera game
  const data = await response.json();

  // Función auxiliar para normalizar el formato de una carta
  const normalizeCard = (card: any) => {
    // Verificar si la carta ya tiene formato correcto
    if (card && typeof card === 'object') {
      return {
        id: card.id || '',
        // Usar imageUrl si existe, si no usar url, y si tampoco hay url usar path local
        imageUrl: card.imageUrl || card.url || `/cards/${card.id}.jpg`
      };
    }
    // Si la carta no es un objeto, devolver un objeto vacío con propiedades seguras
    return { id: '', imageUrl: '/cards/default.jpg' };
  };

  if (data.game && data.myHand) {
    // Encontrar el jugador actual para añadir la mano
    const playerId = sessionStorage.getItem('playerId');
    if (playerId) {
      // Log para debug
      console.log("Datos de myHand recibidos:", JSON.stringify(data.myHand));
      console.log("Formato de las cartas en myHand (datos crudos):", data.myHand);
      
      // Normalizar el formato de todas las cartas en la mano
      const transformedHand = Array.isArray(data.myHand) 
        ? data.myHand.map(normalizeCard) 
        : [];
      
      console.log("Mano transformada:", JSON.stringify(transformedHand));
      
      // Simular el formato antiguo - actualizar el objeto game para incluir la mano en el jugador adecuado
      const gameWithHand = { 
        ...data.game,
        players: data.game.players.map((p: any) => {
          if (p.id === playerId) {
            return { ...p, hand: transformedHand };
          }
          // También normalizar las cartas de otros jugadores si tienen mano
          if (p.hand && Array.isArray(p.hand)) {
            return { ...p, hand: p.hand.map(normalizeCard) };
          }
          return p;
        })
      };
      return gameWithHand;
    }
    return data.game;
  }
  
  // Si tenemos un formato tradicional, también normalizar las cartas de todos los jugadores
  if (data && typeof data === 'object' && data.players && Array.isArray(data.players)) {
    return {
      ...data,
      players: data.players.map((player: any) => {
        if (player.hand && Array.isArray(player.hand)) {
          return { ...player, hand: player.hand.map(normalizeCard) };
        }
        return player;
      })
    };
  }
  
  // Devolvemos el objeto tal cual si no tiene la estructura esperada
  return data;
}

export async function leaveGame(gameCode: string, playerId: string) {
  const url = `${config.api.baseUrl}${config.api.endpoints.leaveGame(gameCode)}`;
  
  // Obtener el token de autenticación
  const accessToken = sessionStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No hay sesión activa');
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ playerId })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Error al abandonar el juego');
  }

  return response.json();
}

// Export all types needed by the rest of the application
export type { 
  Card,
  Player,
  Submission,
  Vote,
  GameStage,
};

// Definición de Game para la integración con WebSockets
export interface Game {
  id?: string;
  code: string;
  stage: GameStage;
  players: Player[];
  rounds?: any[];
  clue?: string;
  narratorId?: string;
  submissions?: { playerId: string; cardId: string }[];
} 