import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { Player } from '../api';
import Button from './Button';
import { useToast } from '../hooks/useToast';

/**
 * Component that shows the waiting room screen before a game starts.
 * Players can see who has joined and the host can start the game when ready.
 */
const WaitingRoom: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const { game, playerId, startGame, isLoading, error } = useGameStore();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  if (!game) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const currentPlayer = game.players.find((p: Player) => p.id === playerId);
  const isHost = currentPlayer?.isHost || false;
  
  // Determine if we have enough players to start (3 or more)
  const canStart = game.players.length >= 3;

  const copyInviteLink = () => {
    const url = window.location.origin + '/join/' + game.code;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        toast.showSuccess('Invite link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.showError('Failed to copy link');
      });
  };

  const handleStartGame = async () => {
    if (!gameCode) {
      toast.showError('Game code not found');
      return;
    }

    if (!canStart) {
      toast.showError('Need at least 3 players to start');
      return;
    }
    
    try {
      await startGame(gameCode);
      toast.showSuccess('Game started!');
    } catch (err) {
      // Error is shown by store, just add a toast
      toast.showError('Failed to start game');
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-2">Waiting Room</h2>
        <h3 className="text-xl text-center mb-6">Game Code: <span className="text-primary font-bold">{game.code}</span></h3>
        
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <Button
              onClick={copyInviteLink}
              className="bg-gray-700 hover:bg-gray-600 text-white"
            >
              {copied ? 'Copied!' : 'Copy Invite Link'}
            </Button>
          </div>
          
          <p className="text-center text-gray-400 text-sm mb-2">
            Share this link or code with friends to join
          </p>
          
          {isHost && (
            <div className="text-center text-sm text-gray-400">
              As the host, you can start the game when everyone has joined
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 mb-8">
          <h4 className="font-medium mb-4 text-center">Players ({game.players.length})</h4>
          <div className="space-y-2">
            {game.players.map((player: Player) => (
              <div 
                key={player.id} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  player.id === playerId ? 'bg-primary/20 border border-primary/50' : 'bg-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/30 flex items-center justify-center mr-3">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">
                      {player.name}
                      {player.id === playerId && <span className="ml-2 text-xs">(You)</span>}
                    </div>
                    {player.isHost && (
                      <div className="text-xs text-primary">Host</div>
                    )}
                  </div>
                </div>
                <div className="text-xs bg-gray-600 px-2 py-1 rounded-full">
                  Ready
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {isHost && (
          <div className="text-center">
            <Button
              onClick={handleStartGame}
              disabled={isLoading || !canStart}
              className="bg-primary hover:bg-primary/80 text-white px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full mr-2" />
                  Starting Game...
                </span>
              ) : (
                'Start Game'
              )}
            </Button>
            
            {!canStart && (
              <p className="mt-2 text-sm text-red-400">
                Need at least 3 players to start
              </p>
            )}
          </div>
        )}
        
        {!isHost && (
          <p className="text-center text-gray-400">
            Waiting for the host to start the game...
          </p>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 text-red-100 rounded text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom; 