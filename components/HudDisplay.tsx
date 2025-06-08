
import React from 'react';
import { PowerUp, Mission, ActivePowerUpMode, GameStats } from '../types';
import { getPowerUpIcon, getPowerUpTooltip, PowerUpColors } from '../utils/theme';

interface HudDisplayProps {
  score: number;
  energy: number;
  turn: number;
  mission: Mission;
  availablePowerUps: PowerUp[];
  gameStats: GameStats;
  isDoublerActive: boolean;
  activePowerUpMode: ActivePowerUpMode;
  onActivatePowerUp: (id: string) => void;
  onCancelPowerUp: () => void;
}

const StatItem: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className }) => (
  <div className={`p-3 bg-slate-700 rounded-lg shadow text-center ${className}`}>
    <div className="text-xs text-sky-300 uppercase tracking-wider">{label}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

const HudDisplay: React.FC<HudDisplayProps> = ({
  score, energy, turn, mission, availablePowerUps, gameStats,
  isDoublerActive, activePowerUpMode, onActivatePowerUp, onCancelPowerUp
}) => {
  const isTargetingPowerUp = activePowerUpMode === ActivePowerUpMode.BOMB_TARGETING || 
                             activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_1 ||
                             activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_2;

  return (
    <div className="w-full md:w-96 p-4 space-y-4 bg-slate-800 rounded-lg shadow-2xl text-slate-100">
      <div className="grid grid-cols-3 gap-2">
        <StatItem label="Score" value={score} />
        <StatItem label="Energy" value={energy} className={energy <= 5 ? 'text-red-400' : energy <=10 ? 'text-yellow-400' : 'text-green-400'}/>
        <StatItem label="Turn" value={turn} />
      </div>

      {isDoublerActive && (
        <div className="p-2 text-center bg-yellow-500 text-black rounded-md font-semibold animate-pulse">
          2x Doubler ACTIVE for next merge!
        </div>
      )}
      
      {isTargetingPowerUp && (
         <div className="p-3 bg-blue-600 rounded-lg text-center">
            <p className="font-semibold text-white">
                {activePowerUpMode === ActivePowerUpMode.BOMB_TARGETING && "Select Bomb Target"}
                {activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_1 && "Select First Tile to Teleport"}
                {activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_2 && "Select Second Tile to Teleport"}
            </p>
            <button 
                onClick={onCancelPowerUp} 
                className="mt-2 px-3 py-1 bg-red-500 hover:bg-red-700 text-white text-xs rounded shadow"
            >
                Cancel Power-Up
            </button>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-sky-200 border-b border-slate-700 pb-1">Mission</h3>
        <div className="p-3 bg-slate-700 rounded-lg shadow">
          <p className="text-sm text-slate-300">{mission.description}</p>
          <div className="w-full bg-slate-600 rounded-full h-2.5 mt-2">
            <div 
              className={`h-2.5 rounded-full ${mission.isCompleted ? 'bg-green-500' : 'bg-sky-500'}`} 
              style={{ width: `${mission.isCompleted ? 100 : Math.min(100, (mission.progress / (mission.target.count || mission.target.chainLength || mission.target.scoreInMerge || mission.target.enemiesDestroyed || 1)) * 100)}%` }}
            ></div>
          </div>
          {mission.isCompleted && <p className="text-xs text-green-400 mt-1">Completed! Reward: {JSON.stringify(mission.reward)}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-sky-200 border-b border-slate-700 pb-1">Power-Ups</h3>
        {availablePowerUps.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availablePowerUps.map(pu => (
              <button
                key={pu.id}
                onClick={() => onActivatePowerUp(pu.id)}
                disabled={isTargetingPowerUp || isDoublerActive && pu.type === 'DOUBLER'}
                title={getPowerUpTooltip(pu.type)}
                className={`p-3 rounded-lg text-white font-semibold text-lg shadow-md hover:scale-105 transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${PowerUpColors[pu.type]}`}
              >
                {getPowerUpIcon(pu.type)}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No power-ups available. Make longer chains!</p>
        )}
      </div>
      
      <div className="space-y-2 pt-2 border-t border-slate-700">
        <h3 className="text-lg font-semibold text-sky-200">Game Stats</h3>
        <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
            <p>Merges: <span className="font-semibold text-white">{gameStats.mergesMade}</span></p>
            <p>Max Chain: <span className="font-semibold text-white">{gameStats.maxChainLength}</span></p>
            <p>Highest Tile: <span className="font-semibold text-white">{gameStats.highestTileValue}</span></p>
            <p>Enemies Defeated: <span className="font-semibold text-white">{gameStats.enemiesDefeated}</span></p>
            <p>Powerups Used: <span className="font-semibold text-white">{gameStats.powerUpsUsed}</span></p>
        </div>
      </div>

    </div>
  );
};

export default HudDisplay;
