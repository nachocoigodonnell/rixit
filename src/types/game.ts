export interface Player {
  id: string;
  name: string;
  score: number;
  hand: Card[];
}

export interface Card {
  id: string;
  imageUrl: string;
}

export interface Submission {
  playerId: string;
  cardId: string;
}

export interface Vote {
  voterId: string;
  cardId: string;
}

export interface Round {
  number: number;
  narratorId: string;
  clue: string;
  submissions: Submission[];
  votes: Vote[];
  revealOrder: string[]; // card IDs in the order they will be revealed
}

export type GameStage = 'lobby' | 'clue' | 'submit' | 'vote' | 'reveal';

export interface Game {
  code: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  round: Round | null;
  stage: GameStage;
  roundsCompleted: number;
  winningScore: number;
} 