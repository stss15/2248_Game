
import React from 'react';
import { GameOverReason, GameStats } from '../types';

interface GameOverModalProps {
  reason: GameOverReason | null;
  score: number;
  gameStats: GameStats;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ reason, score, gameStats, onRestart }) => {
  if (!reason) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl text-center w-full max-w-md transform transition-all scale-100 opacity-100 hud-glass">
        <h2 className="text-3xl font-bold text-red-500 mb-3 font-press-start">Game Over!</h2>
        <p className="text-slate-300 text-lg mb-6">{reason}</p>
        
        <div className="mb-6 p-4 bg-slate-700 rounded-lg">
            <p className="text-xl text-sky-300">Final Score: <span className="font-bold text-white text-2xl">{score}</span></p>
        </div>

        <div className="text-left text-sm text-slate-400 mb-6 space-y-1 p-3 bg-slate-750 rounded">
            <h4 className="font-semibold text-slate-200 mb-2">Summary:</h4>
            <p>Merges Made: <span className="font-bold text-white">{gameStats.mergesMade}</span></p>
            <p>Highest Tile Value: <span className="font-bold text-white">{gameStats.highestTileValue}</span></p>
            <p>Longest Chain: <span className="font-bold text-white">{gameStats.maxChainLength}</span></p>
            <p>Enemies Defeated: <span className="font-bold text-white">{gameStats.enemiesDefeated}</span></p>
            <p>Power-ups Used: <span className="font-bold text-white">{gameStats.powerUpsUsed}</span></p>
        </div>

        <button
          onClick={onRestart}
          className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md text-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        >
          Restart Game
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
