import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../api';
import { useGameStore } from '../../store/useGameStore';
import { useToast } from '../../hooks/useToast';
import Button from '../Button';

/**
 * Component for players to vote on which card belongs to the narrator.
 */
const VoteStep: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const { game, playerId, voteCard, isLoading, error } = useGameStore();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const toast = useToast();

  // Only show this component if we're in the vote stage
  if (!game || game.stage !== 'vote') {
    return null;
  }

  // Find the current player
  const currentPlayer = game.players.find(p => p.id === playerId);
  if (!currentPlayer) return null;

  // If current player is the narrator, they don't vote
  const isNarrator = game.narratorId === playerId;
  if (isNarrator) {
    return (
      <div className="text-center py-6">
        <h3 className="text-xl font-medium mb-4">Waiting for Votes</h3>
        <p className="text-gray-400">
          Players are voting on which card they think is yours...
        </p>
        <div className="mt-8 flex flex-col items-center">
          <div className="text-sm text-gray-400 mb-2">Your clue:</div>
          <div className="text-xl font-medium bg-gray-800 px-4 py-2 rounded-lg">
            "{game.clue}"
          </div>
        </div>
      </div>
    );
  }

  // Check if player already voted
  const hasVoted = game.votes.some(v => v.voterId === playerId);
  if (hasVoted) {
    return (
      <div className="text-center py-6">
        <h3 className="text-xl font-medium mb-4">Vote Submitted</h3>
        <p className="text-gray-400">
          You've cast your vote. Waiting for other players...
        </p>
        <div className="mt-8 flex flex-col items-center">
          <div className="text-sm text-gray-400 mb-2">Narrator's clue:</div>
          <div className="text-xl font-medium bg-gray-800 px-4 py-2 rounded-lg">
            "{game.clue}"
          </div>
        </div>
      </div>
    );
  }

  // Find submission from current player to exclude it from voting options
  const playerSubmission = game.submissions.find(s => s.playerId === playerId);
  
  // Filter out the player's own card from available voting options
  const votableCards = game.submissions.filter(s => 
    s.playerId !== playerId
  );

  const handleVote = async () => {
    if (!selectedCardId) {
      toast.showError('Please select a card to vote');
      return;
    }
    
    if (!gameCode) {
      toast.showError('Game code not found');
      return;
    }
    
    try {
      await voteCard(gameCode, selectedCardId);
      toast.showSuccess('Vote submitted successfully');
    } catch (err) {
      // Error is handled by the store, just show a toast
      toast.showError('Failed to submit vote');
    }
  };

  return (
    <div className="py-6">
      <h3 className="text-xl font-medium mb-4 text-center">Vote for the Narrator's Card</h3>
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="text-sm text-gray-400 mb-2">Narrator's clue:</div>
          <div className="text-xl font-medium bg-gray-800 px-4 py-2 rounded-lg">
            "{game.clue}"
          </div>
          <p className="mt-4 text-sm text-gray-400">
            Which card do you think belongs to the narrator?
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {votableCards.map(submission => {
            const cardImageUrl = `/cards/${submission.cardId}.jpg`;
            return (
              <div 
                key={submission.cardId} 
                className={`relative cursor-pointer rounded-lg overflow-hidden transform transition-all ${
                  selectedCardId === submission.cardId 
                    ? 'scale-105 ring-2 ring-primary' 
                    : 'hover:scale-102'
                }`}
                onClick={() => setSelectedCardId(submission.cardId)}
              >
                <img 
                  src={cardImageUrl} 
                  alt="Card" 
                  className="w-full h-auto"
                />
              </div>
            );
          })}
        </div>
        
        <div className="text-center">
          <Button
            onClick={handleVote}
            disabled={isLoading || !selectedCardId}
            className="bg-primary hover:bg-primary/80 text-white px-8"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2" />
                Submitting Vote...
              </span>
            ) : (
              'Submit Vote'
            )}
          </Button>
        </div>
        
        {error && (
          <div className="mt-4 p-2 bg-red-500/20 text-red-100 rounded text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoteStep; 