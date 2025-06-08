
import React from 'react';
import { Tile, Position, Enemy } from '../types';
import { getTileColors } from '../utils/theme';
import { ENEMY_TARGET_R, ENEMY_TARGET_C } from '../constants';

interface TileDisplayProps {
  tile: Tile | null;
  position: Position;
  enemyOnTile: Enemy | null;
  isSelected: boolean;
  isPathEnd: boolean;
  isTeleportTarget?: boolean;
  onInteraction: (r: number, c: number, type: 'down' | 'enter' | 'up') => void;
}

const TileDisplay: React.FC<TileDisplayProps> = ({ tile, position, enemyOnTile, isSelected, isPathEnd, isTeleportTarget, onInteraction }) => {
  const handleMouseDown = () => onInteraction(position.r, position.c, 'down');
  const handleMouseEnter = () => onInteraction(position.r, position.c, 'enter');
  // onMouseUp is typically handled globally in the parent component (GridDisplay or App)

  const tileValue = tile?.value;
  const cooldown = tile?.cooldown || 0;
  
  const tileClasses = getTileColors(tileValue ?? 0, cooldown, !!enemyOnTile, isSelected, isPathEnd);
  const displayValue = tileValue !== null && tileValue !== undefined ? tileValue : '';

  const isCenterCell = position.r === ENEMY_TARGET_R && position.c === ENEMY_TARGET_C;

  return (
    <div
      className={`w-full aspect-square ${tileClasses} ${isTeleportTarget ? 'ring-4 ring-green-400 animate-pulse' : ''} ${isCenterCell && !enemyOnTile ? 'bg-opacity-50 border-dashed border-sky-400' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      role="button"
      aria-label={`Tile at ${position.r}, ${position.c} with value ${displayValue}`}
      tabIndex={0} // for accessibility, though drag is mouse-centric
    >
      {enemyOnTile && (
        <span className="absolute text-3xl animate-bounce z-10" role="img" aria-label="Enemy">💀</span>
      )}
      {cooldown > 0 && !enemyOnTile && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg z-20">
          <span className="text-white text-xl font-bold font-mono">{cooldown}</span>
        </div>
      )}
      {tile && !enemyOnTile && (
         <span className={`tile-value-display ${tile.value >= 1000 ? 'text-sm' : tile.value >=100 ? 'text-base' : 'text-xl' }`}>
            {displayValue}
         </span>
      )}
      {isCenterCell && !tile && !enemyOnTile && (
        <span className="text-sky-300 text-3xl font-bold opacity-50">🎯</span>
      )}
    </div>
  );
};

export default TileDisplay;
