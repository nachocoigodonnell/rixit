import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../api';
import { useGameStore } from '../../store/useGameStore';
import { useToast } from '../../hooks/useToast';
import Button from '../Button';

/**
 * Component for non-narrator players to submit a card that matches the clue.
 */
const SubmitStep: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const { game, playerId, submitCard, isLoading, error } = useGameStore();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const toast = useToast();

  // Only show this component if we're in the submit stage
  if (!game || game.stage !== 'submit') {
    return null;
  }

  // Find the current player
  const currentPlayer = game.players.find(p => p.id === playerId);
  if (!currentPlayer) return null;

  // Find the narrator player
  const narrator = game.players.find(p => p.id === game.narratorId);
  if (!narrator) return null;

  // Check if the current player is the narrator (who should be skipped)
  const isNarrator = game.narratorId === playerId;
  if (isNarrator) {
    return (
      <div className="text-center py-6">
        <h3 className="text-xl font-medium mb-4">Waiting for Other Players</h3>
        <p className="text-gray-400">
          Other players are selecting cards that match your clue...
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

  // Check if this player has already submitted a card
  const hasSubmitted = game.submissions.some(s => s.playerId === playerId);
  if (hasSubmitted) {
    return (
      <div className="text-center py-6">
        <h3 className="text-xl font-medium mb-4">Card Submitted</h3>
        <p className="text-gray-400">
          You've submitted your card. Waiting for other players...
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

  const handleSubmit = async () => {
    if (!selectedCard) {
      toast.showError('Please select a card');
      return;
    }
    
    if (!gameCode) {
      toast.showError('Game code not found');
      return;
    }
    
    try {
      await submitCard(gameCode, selectedCard);
      toast.showSuccess('Card submitted successfully');
    } catch (err) {
      // Error is handled by the store, just show a toast
      toast.showError('Failed to submit card');
    }
  };

  return (
    <div className="py-6">
      <h3 className="text-xl font-medium mb-4 text-center">Select a Card</h3>
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="text-sm text-gray-400 mb-2">Narrator's clue:</div>
          <div className="text-xl font-medium bg-gray-800 px-4 py-2 rounded-lg">
            "{game.clue}"
          </div>
          <p className="mt-4 text-sm text-gray-400">
            Choose a card from your hand that best matches the clue.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {currentPlayer.hand.map((card: Card) => (
            <div 
              key={card.id} 
              className={`relative cursor-pointer rounded-lg overflow-hidden transform transition-all ${
                selectedCard === card.id 
                  ? 'scale-105 ring-2 ring-secondary' 
                  : 'hover:scale-102'
              }`}
              onClick={() => setSelectedCard(card.id)}
            >
              <img 
                src={card.imageUrl} 
                alt="Card" 
                className="w-full h-auto"
              />
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !selectedCard}
            className="bg-secondary hover:bg-secondary/80 text-white px-8"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2" />
                Submitting...
              </span>
            ) : (
              'Submit Card'
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

export default SubmitStep; 