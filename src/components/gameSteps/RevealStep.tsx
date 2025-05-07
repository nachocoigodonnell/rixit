import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, Player, Submission, Vote } from '../../api';
import { useGameStore } from '../../store/useGameStore';
import { useToast } from '../../hooks/useToast';
import Button from '../Button';

/**
 * Component to display the results of a round, including scores and card reveals.
 */
const RevealStep: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const { game, playerId, revealRound, isLoading, error } = useGameStore();
  const toast = useToast();

  // Only show this component if we're in the reveal stage
  if (!game || game.stage !== 'reveal') {
    return null;
  }

  // Find the current player
  const currentPlayer = game.players.find((p: Player) => p.id === playerId);
  if (!currentPlayer) return null;

  // Find the narrator
  const narrator = game.players.find((p: Player) => p.id === game.narratorId);
  if (!narrator) return null;

  // Find the narrator's card
  const narratorSubmission = game.submissions.find(
    (s: Submission) => s.playerId === game.narratorId
  );
  if (!narratorSubmission) return null;

  // Count votes for each card
  const votesByCard = game.submissions.map((submission: Submission) => {
    const votes = game.votes.filter((v: Vote) => v.cardId === submission.cardId);
    const submitter = game.players.find((p: Player) => p.id === submission.playerId);
    return {
      cardId: submission.cardId,
      playerId: submission.playerId,
      playerName: submitter?.name || 'Unknown',
      isNarratorCard: submission.playerId === game.narratorId,
      votes: votes.length,
      voters: votes.map((v: Vote) => {
        const voter = game.players.find((p: Player) => p.id === v.voterId);
        return voter?.name || 'Unknown';
      }),
    };
  });

  // Check if the host is the current player
  const isHost = currentPlayer.isHost;

  const handleNextRound = async () => {
    if (!gameCode) {
      toast.showError('Game code not found');
      return;
    }
    
    try {
      await revealRound(gameCode);
      toast.showSuccess('Started next round');
    } catch (err) {
      // Error is handled by the store, just show a toast
      toast.showError('Failed to start next round');
    }
  };

  return (
    <div className="py-6">
      <h3 className="text-xl font-medium mb-6 text-center">Round Results</h3>
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <div className="text-sm text-gray-400 mb-2">Narrator's clue:</div>
          <div className="text-xl font-medium bg-gray-800 px-4 py-2 rounded-lg">
            "{game.clue}"
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {votesByCard.map((item: {
            cardId: string;
            playerId: string;
            playerName: string;
            isNarratorCard: boolean;
            votes: number;
            voters: string[];
          }) => {
            const cardImageUrl = `/cards/${item.cardId}.jpg`;
            return (
              <div 
                key={item.cardId} 
                className={`rounded-lg overflow-hidden border-2 ${
                  item.isNarratorCard ? 'border-primary' : 'border-gray-700'
                }`}
              >
                <div className="relative">
                  <img 
                    src={cardImageUrl} 
                    alt="Card" 
                    className="w-full h-auto"
                  />
                  {item.isNarratorCard && (
                    <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                      Narrator's Card
                    </div>
                  )}
                </div>
                <div className="p-3 bg-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">
                      {item.playerName}
                    </div>
                    <div className="text-xs bg-gray-700 rounded-full px-2 py-1">
                      {item.votes} {item.votes === 1 ? 'vote' : 'votes'}
                    </div>
                  </div>
                  {item.voters.length > 0 && (
                    <div className="mt-1 text-xs text-gray-400">
                      <span className="block mb-1">Voted by:</span>
                      <div className="flex flex-wrap gap-1">
                        {item.voters.map((name: string, idx: number) => (
                          <span key={idx} className="bg-gray-700 px-2 py-0.5 rounded-full">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-3 text-center">Scores</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="py-2 pl-4">Player</th>
                  <th className="py-2 px-4 text-center">Score</th>
                </tr>
              </thead>
              <tbody>
                {game.players
                  .sort((a: Player, b: Player) => b.score - a.score)
                  .map((player: Player) => (
                    <tr 
                      key={player.id} 
                      className={`border-b border-gray-800 ${
                        player.id === playerId ? 'bg-gray-800' : ''
                      }`}
                    >
                      <td className="py-2 pl-4 font-medium">
                        {player.name}
                        {player.id === game.narratorId && (
                          <span className="ml-2 text-xs text-primary">(Narrator)</span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-center">{player.score}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {isHost && (
          <div className="text-center mt-8">
            <Button
              onClick={handleNextRound}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/80 text-white px-8"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2" />
                  Starting Next Round...
                </span>
              ) : (
                'Start Next Round'
              )}
            </Button>
          </div>
        )}
        
        {!isHost && (
          <p className="text-center text-gray-400 mt-8">
            Waiting for the host to start the next round...
          </p>
        )}
        
        {error && (
          <div className="mt-4 p-2 bg-red-500/20 text-red-100 rounded text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default RevealStep; 