/**
 * API wrapper layer for Rixit game
 * This module connects the frontend with the mock backend.
 * When the real backend is ready, replace with actual API calls.
 */

import { 
  startRoundMock, // TODO reemplazar cuando exista endpoint
  submitClueMock,
  submitCardMock,
  voteCardMock,
  revealRoundMock,
  Card,
  Player,
  Submission,
  Vote,
  GameStage,
  leaveGameMock,
  createGameMock,
  joinGameMock,
  getGameMock,
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
  return startRoundMock(gameCode);
}

/**
 * Submits the narrator's clue and card
 */
export async function submitClue(gameCode: string, narratorId: string, clue: string, cardId: string) {
  return submitClueMock(gameCode, narratorId, clue, cardId);
}

/**
 * Submits a player's card based on the clue
 */
export async function submitCard(gameCode: string, playerId: string, cardId: string) {
  return submitCardMock(gameCode, playerId, cardId);
}

/**
 * Casts a player's vote for a card
 */
export async function voteCard(gameCode: string, voterId: string, cardId: string) {
  return voteCardMock(gameCode, voterId, cardId);
}

/**
 * Processes the end of a round and advances the game
 */
export async function revealRound(gameCode: string) {
  return revealRoundMock(gameCode);
}

export async function getGame(gameCode: string) {
  const url = `${config.api.baseUrl}${config.api.endpoints.gameByCode(gameCode)}`;
  const response = await fetch(url);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to load game');
  }
  return response.json();
}

export async function leaveGame(gameCode: string, playerId: string) {
  return leaveGameMock(gameCode, playerId);
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
} 