import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import ClueStep from './ClueStep';
import SubmitStep from './SubmitStep';
import VoteStep from './VoteStep';
import RevealStep from './RevealStep';
import WaitingRoom from '../../components/WaitingRoom';
/**
 * Component that renders the appropriate game step based on the current game stage.
 */
const GameSteps: React.FC = () => {
  const { game } = useGameStore();

  if (!game) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Show waiting room if the game has not started
  if (game.stage === 'lobby') {
    return <WaitingRoom />;
  }

  // Show different components based on game stage
  switch (game.stage) {
    case 'clue':
      return <ClueStep />;
    case 'submit':
      return <SubmitStep />;
    case 'vote':
      return <VoteStep />;
    case 'reveal':
      return <RevealStep />;
    default:
      return (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Unknown Game Stage</h2>
          <p className="text-gray-400">
            The game is in an unknown stage: {game.stage}
          </p>
        </div>
      );
  }
};

export default GameSteps; 