/**
 * Game state management with Zustand
 * Central store for all game-related state
 */

import { create } from 'zustand';
import { 
  Game, 
  createGame, 
  joinGame, 
  startRound, 
  submitClue,
  submitCard,
  voteCard,
  revealRound,
  getGame,
  leaveGame as leaveGameApi,
} from '../api';

interface GameState {
  // State
  game: Game | null;
  playerId: string | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setGame: (game: Game) => void;
  setCredentials: (playerId: string, accessToken: string) => void;
  clearError: () => void;
  resetGame: () => void;

  // API Actions
  createGame: (playerName: string, playerCount: number) => Promise<void>;
  joinGame: (gameCode: string, playerName: string) => Promise<boolean>;
  startRound: (gameCode: string) => Promise<void>;
  submitClue: (gameCode: string, clue: string, cardId: string) => Promise<void>;
  submitCard: (gameCode: string, cardId: string) => Promise<void>;
  voteCard: (gameCode: string, cardId: string) => Promise<void>;
  revealRound: (gameCode: string) => Promise<void>;
  loadGame: (gameCode: string, playerId: string) => Promise<void>;
  leaveGame: (gameCode: string, playerId: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  game: null,
  playerId: null,
  accessToken: null,
  isLoading: false,
  error: null,

  // Basic state setters
  setGame: (game) => set({ game }),
  setCredentials: (playerId, accessToken) => set({ playerId, accessToken }),
  clearError: () => set({ error: null }),
  resetGame: () => set({ 
    game: null,
    playerId: null,
    accessToken: null,
    error: null,
    isLoading: false
  }),

  // API Actions
  createGame: async (playerName, playerCount) => {
    set({ isLoading: true, error: null });
    try {
      const { gameCode, accessToken, playerId } = await createGame(playerName, playerCount);
      
      // Store auth info
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('playerId', playerId);
      sessionStorage.setItem('gameCode', gameCode);

      // Fetch initial game state so LobbyPage puede mostrar datos
      const game = await getGame(gameCode);

      set({ 
        game,
        accessToken,
        playerId,
        isLoading: false
      });

      return;
    } catch (error) {
      console.error('Error creating game:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create game',
        isLoading: false 
      });
    }
  },

  joinGame: async (gameCode, playerName) => {
    console.log('Joining game:', gameCode, playerName);
    set({ isLoading: true, error: null });
    try {
      const { game, accessToken, playerId } = await joinGame(gameCode, playerName);
      
      // Store auth info
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('playerId', playerId);
      sessionStorage.setItem('gameCode', gameCode);
      sessionStorage.setItem('playerName', playerName);

      set({ 
        game,
        accessToken,
        playerId,
        isLoading: false 
      });

      return true;
    } catch (error) {
      console.error('Error joining game:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to join game',
        isLoading: false 
      });
      throw error;
    }
  },

  startRound: async (gameCode) => {
    set({ isLoading: true, error: null });
    try {
      const game = await startRound(gameCode);
      set({ game, isLoading: false });
    } catch (error) {
      console.error('Error starting round:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to start round',
        isLoading: false 
      });
    }
  },

  submitClue: async (gameCode, clue, cardId) => {
    const { playerId } = get();
    if (!playerId) {
      set({ error: 'Player ID not found' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const game = await submitClue(gameCode, playerId, clue, cardId);
      set({ game, isLoading: false });
    } catch (error) {
      console.error('Error submitting clue:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to submit clue',
        isLoading: false 
      });
    }
  },

  submitCard: async (gameCode, cardId) => {
    const { playerId } = get();
    if (!playerId) {
      set({ error: 'Player ID not found' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const game = await submitCard(gameCode, playerId, cardId);
      set({ game, isLoading: false });
    } catch (error) {
      console.error('Error submitting card:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to submit card',
        isLoading: false 
      });
    }
  },

  voteCard: async (gameCode, cardId) => {
    const { playerId } = get();
    if (!playerId) {
      set({ error: 'Player ID not found' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const game = await voteCard(gameCode, playerId, cardId);
      set({ game, isLoading: false });
    } catch (error) {
      console.error('Error voting for card:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to vote for card',
        isLoading: false 
      });
    }
  },

  revealRound: async (gameCode) => {
    set({ isLoading: true, error: null });
    try {
      const game = await revealRound(gameCode);
      set({ game, isLoading: false });
    } catch (error) {
      console.error('Error revealing round:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to reveal round',
        isLoading: false 
      });
    }
  },

  loadGame: async (gameCode, playerId) => {
    console.log('Loading game:', gameCode, playerId);
    set({ isLoading: true, error: null });
    try {
      const game = await getGame(gameCode);
      
      // Debug - Ver la estructura del juego y la mano del jugador actual
      console.log('Game loaded:', game);
      const playerWithHand = game.players.find((p: { id: string }) => p.id === playerId);
      console.log('Current player hand:', playerWithHand?.hand);
      
      // Recuperar token de acceso de la sesión
      const accessToken = sessionStorage.getItem('accessToken') || null;
      
      // Establecer todos los datos necesarios
      set({
        game,
        playerId,
        accessToken,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error loading game:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load game',
        isLoading: false 
      });
    }
  },

  leaveGame: async (gameCode, playerId) => {
    set({ isLoading: true, error: null });
    try {
      // Usar la API real para abandonar la partida
      await leaveGameApi(gameCode, playerId);

      // Limpiar estado local inmediatamente (no esperamos respuesta HTTP)
      set({ 
        game: null,
        playerId: null,
        accessToken: null,
        error: null,
        isLoading: false
      });
    } catch (error) {
      console.error('Error leaving game:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to leave game',
        isLoading: false 
      });
    }
  },
})); 