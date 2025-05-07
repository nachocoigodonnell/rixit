/**
 * Mock server implementation for Rixit game API
 * This simulates backend calls with in-memory storage
 */

// Core game types
export interface Card {
  id: string;
  imageUrl: string;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  score: number;
  isHost: boolean;
}

export interface Submission {
  playerId: string;
  cardId: string;
}

export interface Vote {
  voterId: string;
  cardId: string;
}

export type GameStage = 'lobby' | 'clue' | 'submit' | 'vote' | 'reveal';

export interface Game {
  code: string;
  hostId: string;
  players: Player[];
  deck: Card[];
  discard: Card[];
  round: number;
  stage: GameStage;
  narratorId: string | null;
  clue: string;
  submissions: Submission[];
  votes: Vote[];
}

// Mock storage
const activeGames = new Map<string, Game>();

// Helper to load cards from assets
async function loadCards(): Promise<Card[]> {
  // In a real implementation, this might fetch from a real API
  // For now, we'll generate some placeholder cards
  return Array.from({ length: 60 }, (_, i) => {
    const id = String(i + 1).padStart(3, '0');
    return {
      id,
      imageUrl: `/cards/${id}.jpg`,
    };
  });
}

/**
 * Deals cards to a player from the deck
 */
function dealCards(game: Game, playerId: string, count: number): Game {
  const player = game.players.find(p => p.id === playerId);
  if (!player || game.deck.length < count) return game;

  const cardsToAdd = game.deck.slice(0, count);
  const updatedDeck = game.deck.slice(count);

  const updatedPlayer = {
    ...player,
    hand: [...player.hand, ...cardsToAdd]
  };

  return {
    ...game,
    deck: updatedDeck,
    players: game.players.map(p => p.id === playerId ? updatedPlayer : p)
  };
}

/**
 * Shuffles an array (used for deck and player order)
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Creates a new game with the specified host name and player count
 * Returns game code, access token, and player ID for the host
 */
export async function createGameMock(
  playerName: string,
  playerCount: number,
): Promise<{ gameCode: string; accessToken: string; playerId: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      // 409 – player name already taken
      if (playerName.toLowerCase() === 'taken') {
        const err = new Error('Player name already taken');
        // @ts-expect-error dynamic status property for mock
        err.status = 409;
        reject(err);
        return;
      }

      // Generate random game code
      const gameCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      
      // Create player ID and access token for host
      const playerId = `player-${Math.random().toString(36).slice(2, 10)}`;
      const accessToken = `token-${Math.random().toString(36).slice(2)}`;

      // Load and shuffle cards for the game
      const cards = await loadCards();
      const shuffledDeck = shuffle(cards);

      // Create initial game state
      const newGame: Game = {
        code: gameCode,
        hostId: playerId,
        players: [
          {
            id: playerId,
            name: playerName,
            hand: [],
            score: 0,
            isHost: true
          }
        ],
        deck: shuffledDeck,
        discard: [],
        round: 0,
        stage: 'lobby',
        narratorId: null,
        clue: '',
        submissions: [],
        votes: []
      };

      // Deal 6 cards to the host
      const gameWithCards = dealCards(newGame, playerId, 6);
      
      // Store in active games
      activeGames.set(gameCode, gameWithCards);

      resolve({ gameCode, accessToken, playerId });
    }, 800);
  });
}

/**
 * Joins an existing game with the given game code and player name
 * Returns the updated game state
 */
export async function joinGameMock(
  gameCode: string,
  playerName: string,
): Promise<{ game: Game; accessToken: string; playerId: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 404 - game not found
      if (gameCode.toUpperCase() === 'XXXX') {
        const err = new Error('Game not found');
        // @ts-expect-error dynamic status property for mock
        err.status = 404;
        reject(err);
        return;
      }

      const game = activeGames.get(gameCode);
      
      // Game doesn't exist
      if (!game) {
        const err = new Error('Game not found');
        // @ts-expect-error dynamic status property for mock
        err.status = 404;
        reject(err);
        return;
      }

      // Game already started
      if (game.stage !== 'lobby') {
        const err = new Error('Game already in progress');
        // @ts-expect-error dynamic status property for mock
        err.status = 403;
        reject(err);
        return;
      }

      // Check for name collision
      if (playerName.toLowerCase() === 'taken' || 
          game.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
        const err = new Error('Player name already taken');
        // @ts-expect-error dynamic status property for mock
        err.status = 409;
        reject(err);
        return;
      }

      // Create new player
      const playerId = `player-${Math.random().toString(36).slice(2, 10)}`;
      const accessToken = `token-${Math.random().toString(36).slice(2)}`;
      
      const newPlayer: Player = {
        id: playerId,
        name: playerName,
        hand: [],
        score: 0,
        isHost: false
      };

      // Add player and deal cards
      let updatedGame: Game = {
        ...game,
        players: [...game.players, newPlayer]
      };
      
      updatedGame = dealCards(updatedGame, playerId, 6);
      
      // Update in store
      activeGames.set(gameCode, updatedGame);

      resolve({ 
        game: updatedGame, 
        accessToken, 
        playerId 
      });
    }, 800);
  });
}

/**
 * Starts a new round in the game
 * Moves from lobby to clue stage and sets the first narrator
 */
export async function startRoundMock(
  gameCode: string
): Promise<Game> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const game = activeGames.get(gameCode);
      
      if (!game) {
        const err = new Error('Game not found');
        // @ts-expect-error dynamic status property for mock
        err.status = 404;
        reject(err);
        return;
      }

      // Can only start from lobby
      if (game.stage !== 'lobby') {
        const err = new Error('Game already in progress');
        // @ts-expect-error dynamic status property for mock
        err.status = 400;
        reject(err);
        return;
      }

      // Need at least 3 players to start
      if (game.players.length < 3) {
        const err = new Error('Minimum 3 players required');
        // @ts-expect-error dynamic status property for mock
        err.status = 400;
        reject(err);
        return;
      }

      // Set the first narrator (host in the first round)
      const updatedGame: Game = {
        ...game,
        stage: 'clue',
        round: 1,
        narratorId: game.hostId,
        submissions: [],
        votes: []
      };
      
      activeGames.set(gameCode, updatedGame);
      resolve(updatedGame);
    }, 800);
  });
}

/**
 * Submits a clue for the current round
 */
export async function submitClueMock(
  gameCode: string,
  narratorId: string,
  clue: string,
  cardId: string
): Promise<Game> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const game = activeGames.get(gameCode);
      
      if (!game) {
        const err = new Error('Game not found');
        // @ts-expect-error dynamic status property for mock
        err.status = 404;
        reject(err);
        return;
      }

      // Must be in clue stage
      if (game.stage !== 'clue') {
        const err = new Error('Invalid game stage');
        // @ts-expect-error dynamic status property for mock
        err.status = 400;
        reject(err);
        return;
      }

      // Must be the narrator
      if (game.narratorId !== narratorId) {
        const err = new Error('Not the narrator');
        // @ts-expect-error dynamic status property for mock
        err.status = 403;
        reject(err);
        return;
      }

      // Check if card is in narrator's hand
      const narrator = game.players.find(p => p.id === narratorId);
      if (!narrator || !narrator.hand.some(card => card.id === cardId)) {
        const err = new Error('Card not in hand');
        // @ts-expect-error dynamic status property for mock
        err.status = 400;
        reject(err);
        return;
      }

      // Remove card from hand and add to submissions
      const updatedNarrator = {
        ...narrator,
        hand: narrator.hand.filter(card => card.id !== cardId)
      };

      const updatedGame: Game = {
        ...game,
        players: game.players.map(p => p.id === narratorId ? updatedNarrator : p),
        stage: 'submit',
        clue,
        submissions: [{ playerId: narratorId, cardId }]
      };
      
      activeGames.set(gameCode, updatedGame);
      resolve(updatedGame);
    }, 800);
  });
}

/**
 * Submits a player's card for the current round
 */
export async function submitCardMock(
  gameCode: string,
  playerId: string,
  cardId: string
): Promise<Game> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const game = activeGames.get(gameCode);
      
      if (!game) {
        const err = new Error('Game not found');
        // @ts-expect-error dynamic status property for mock
        err.status = 404;
        reject(err);
        return;
      }

      // Must be in submit stage
      if (game.stage !== 'submit') {
        const err = new Error('Invalid game stage');
        // @ts-expect-error dynamic status property for mock
        err.status = 400;
        reject(err);
        return;
      }

      // Cannot be the narrator
      if (game.narratorId === playerId) {
        const err = new Error('Narrator cannot submit');
        // @ts-expect-error dynamic status property for mock
        err.status = 403;
        reject(err);
        return;
      }

      // Check if player already submitted
      if (game.submissions.some(s => s.playerId === playerId)) {
        const err = new Error('Already submitted');
        // @ts-expect-error dynamic status property for mock
        err.status = 400;
        reject(err);
        return;
      }

      // Check if card is in player's hand
      const player = game.players.find(p => p.id === playerId);
      if (!player || !player.hand.some(card => card.id === cardId)) {
        const err = new Error('Card not in hand');
        // @ts-expect-error dynamic status property for mock
        err.status = 400;
        reject(err);
        return;
      }

      // Remove card from hand and add to submissions
      const updatedPlayer = {
        ...player,
        hand: player.hand.filter(card => card.id !== cardId)
      };

      const updatedSubmissions = [...game.submissions, { playerId, cardId }];
      
      // Check if all players have submitted
      const nonNarratorCount = game.players.length - 1;
      const allSubmitted = updatedSubmissions.length === game.players.length;
      
      const updatedGame: Game = {
        ...game,
        players: game.players.map(p => p.id === playerId ? updatedPlayer : p),
        submissions: updatedSubmissions,
        // If all players have submitted, move to vote stage
        stage: allSubmitted ? 'vote' : 'submit'
      };
      
      activeGames.set(gameCode, updatedGame);
      resolve(updatedGame);
    }, 800);
  });
}

/**
 * Records a player's vote for a card
 */
export async function voteCardMock(
  gameCode: string,
  voterId: string,
  cardId: string
): Promise<Game> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const game = activeGames.get(gameCode);
      
      if (!game) {
        const err = new Error('Game not found');
        // @ts-expect-error dynamic status property for mock
        err.status = 404;
        reject(err);
        return;
      }

      // Must be in vote stage
      if (game.stage !== 'vote') {
        const err = new Error('Invalid game stage');
        // @ts-expect-error dynamic status property for mock
        err.status = 400;
        reject(err);
        return;
      }

      // Cannot be the narrator
      if (game.narratorId === voterId) {
        const err = new Error('Narrator cannot vote');
        // @ts-expect-error dynamic status property for mock
        err.status = 403;
        reject(err);
        return;
      }

      // Check if player already voted
      if (game.votes.some(v => v.voterId === voterId)) {
        const err = new Error('Already voted');
        // @ts-expect-error dynamic status property for mock
        err.status = 400;
        reject(err);
        return;
      }

      // Verify the card exists in submissions
      if (!game.submissions.some(s => s.cardId === cardId)) {
        const err = new Error('Invalid card');
        // @ts-expect-error dynamic status property for mock
        err.status = 400;
        reject(err);
        return;
      }

      // Cannot vote for your own card
      const voterSubmission = game.submissions.find(s => s.playerId === voterId);
      if (voterSubmission && voterSubmission.cardId === cardId) {
        const err = new Error('Cannot vote for your own card');
        // @ts-expect-error dynamic status property for mock
        err.status = 400;
        reject(err);
        return;
      }

      const updatedVotes = [...game.votes, { voterId, cardId }];
      
      // Check if all non-narrator players have voted
      const nonNarratorCount = game.players.length - 1;
      const allVoted = updatedVotes.length === nonNarratorCount;
      
      const updatedGame: Game = {
        ...game,
        votes: updatedVotes,
        // If all players have voted, move to reveal stage
        stage: allVoted ? 'reveal' : 'vote'
      };
      
      activeGames.set(gameCode, updatedGame);
      resolve(updatedGame);
    }, 800);
  });
}

/**
 * Processes the end of a round, calculates scores, and advances the game
 */
export async function revealRoundMock(
  gameCode: string
): Promise<Game> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const game = activeGames.get(gameCode);
      
      if (!game) {
        const err = new Error('Game not found');
        // @ts-expect-error dynamic status property for mock
        err.status = 404;
        reject(err);
        return;
      }

      // Must be in reveal stage
      if (game.stage !== 'reveal') {
        const err = new Error('Invalid game stage');
        // @ts-expect-error dynamic status property for mock
        err.status = 400;
        reject(err);
        return;
      }

      // Calculate scores
      const updatedPlayers = calculateScores(game);
      
      // Determine next narrator
      const currentNarratorIndex = game.players.findIndex(p => p.id === game.narratorId);
      const nextNarratorIndex = (currentNarratorIndex + 1) % game.players.length;
      const nextNarratorId = game.players[nextNarratorIndex].id;

      // Replenish cards for all players
      let updatedGame: Game = {
        ...game,
        players: updatedPlayers,
        stage: 'clue',
        round: game.round + 1,
        narratorId: nextNarratorId,
        clue: '',
        submissions: [],
        votes: [],
        // Move played cards to discard pile
        discard: [...game.discard, ...game.submissions.map(s => ({ 
          id: s.cardId, 
          imageUrl: `/cards/${s.cardId}.jpg` 
        }))]
      };

      // Deal new cards to all players who need them
      for (const player of updatedGame.players) {
        const cardsNeeded = 6 - player.hand.length;
        if (cardsNeeded > 0) {
          updatedGame = dealCards(updatedGame, player.id, cardsNeeded);
        }
      }
      
      activeGames.set(gameCode, updatedGame);
      resolve(updatedGame);
    }, 800);
  });
}

/**
 * Calculates scores for a round according to Dixit rules
 */
function calculateScores(game: Game): Player[] {
  if (!game.narratorId) return game.players;
  
  const narratorSubmission = game.submissions.find(s => s.playerId === game.narratorId);
  if (!narratorSubmission) return game.players;
  
  const narratorCardId = narratorSubmission.cardId;
  
  // Count votes for narrator's card
  const votesForNarrator = game.votes.filter(v => v.cardId === narratorCardId).length;
  
  // Count total non-narrator players
  const nonNarratorCount = game.players.length - 1;
  
  // Calculate points based on Dixit rules
  return game.players.map(player => {
    let scoreToAdd = 0;
    
    if (player.id === game.narratorId) {
      // Narrator gets 0 if all or none guessed correctly, 3 otherwise
      if (votesForNarrator === 0 || votesForNarrator === nonNarratorCount) {
        scoreToAdd = 0;
      } else {
        scoreToAdd = 3;
      }
    } else {
      // Non-narrator players
      // +3 if they guessed the narrator's card
      const playerVote = game.votes.find(v => v.voterId === player.id);
      if (playerVote && playerVote.cardId === narratorCardId) {
        scoreToAdd += 3;
      }
      
      // +2 to all if narrator gets 0
      if (votesForNarrator === 0 || votesForNarrator === nonNarratorCount) {
        scoreToAdd += 2;
      }
      
      // +1 for each vote their card received
      const playerSubmission = game.submissions.find(s => s.playerId === player.id);
      if (playerSubmission) {
        const votesForPlayer = game.votes.filter(v => v.cardId === playerSubmission.cardId).length;
        scoreToAdd += votesForPlayer;
      }
    }
    
    return {
      ...player,
      score: player.score + scoreToAdd
    };
  });
} 