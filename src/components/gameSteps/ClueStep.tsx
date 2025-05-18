import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../api';
import { useGameStore } from '../../store/useGameStore';
import { useToast } from '../../hooks/useToast';
import Button from '../Button';

/**
 * Component for the narrator to set a clue and select a card.
 */
const ClueStep: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const { game, playerId, submitClue, isLoading, error } = useGameStore();
  const [clue, setClue] = useState('');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const toast = useToast();

  // Only show this component if we're in the clue stage AND the current user is the narrator
  if (!game || game.stage !== 'clue' || game.narratorId !== playerId) {
    return (
      <div className="text-center py-6">
        <h3 className="text-xl font-medium mb-4">Esperando al narrador</h3>
        <p className="text-gray-400">
          El narrador está eligiendo una carta y pensando en una pista...
        </p>
      </div>
    );
  }

  // Find the current player
  const currentPlayer = game.players.find(p => p.id === playerId);
  if (!currentPlayer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clue.trim()) {
      toast.showError('Please enter a clue');
      return;
    }
    
    if (!selectedCard) {
      toast.showError('Please select a card');
      return;
    }
    
    if (!gameCode) {
      toast.showError('Game code not found');
      return;
    }
    
    try {
      await submitClue(gameCode, clue, selectedCard);
      toast.showSuccess('Clue submitted successfully');
    } catch (err) {
      // Error is handled by the store, just show a toast
      toast.showError('Failed to submit clue');
    }
  };

  return (
    <div className="py-6">
      <h3 className="text-xl font-medium mb-6 text-center">Eres el Narrador</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <label htmlFor="clue" className="block text-sm font-medium">
            Tu Pista
          </label>
          <input
            id="clue"
            type="text"
            value={clue}
            onChange={(e) => setClue(e.target.value)}
            placeholder="Introduce una palabra, frase o sonido..."
            className="w-full px-3 py-2 rounded border border-gray-700 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-400">
            ¡Sé creativo! No demasiado obvio, pero tampoco imposible.
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-3">Selecciona una carta que encaje con tu pista</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {currentPlayer.hand.map((card: Card) => (
              <div 
                key={card.id} 
                className={`relative cursor-pointer rounded-lg overflow-hidden transform transition-all ${
                  selectedCard === card.id 
                    ? 'scale-105 ring-2 ring-primary' 
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
        </div>
        
        <div className="text-center">
          <Button
            type="submit"
            disabled={isLoading || !clue.trim() || !selectedCard}
            className="bg-primary hover:bg-primary/80 text-white px-8"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2" />
                Enviando...
              </span>
            ) : (
              'Enviar pista y carta'
            )}
          </Button>
        </div>
      </form>
      
      {error && (
        <div className="mt-4 p-2 bg-red-500/20 text-red-100 rounded text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default ClueStep; 