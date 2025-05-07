/**
 * API wrapper layer for Rixit game
 * This module connects the frontend with the mock backend.
 * When the real backend is ready, replace with actual API calls.
 */

import { 
  createGameMock, 
  joinGameMock, 
  startRoundMock, 
  submitClueMock,
  submitCardMock, 
  voteCardMock, 
  revealRoundMock,
  Game, 
  Card,
  Player,
  Submission,
  Vote,
  GameStage,
} from './mockServer';

// TODO: Replace mock implementations with real fetch/API calls when backend is ready

/**
 * Creates a new game with the specified player name and player count
 */
export async function createGame(playerName: string, playerCount: number) {
  return createGameMock(playerName, playerCount);
}

/**
 * Joins an existing game with the specified game code and player name
 */
export async function joinGame(gameCode: string, playerName: string) {
  return joinGameMock(gameCode, playerName);
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

// Export all types needed by the rest of the application
export type { 
  Game, 
  Card,
  Player,
  Submission,
  Vote,
  GameStage,
}; 