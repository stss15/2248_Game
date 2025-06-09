
import React from 'react';
import { useTransition, animated } from 'react-spring';
import { playSound, SoundType } from '../utils/audioManager';
import { Grid, Position, Enemy, ActivePowerUpMode } from '../types';
import TileDisplay from './TileDisplay';

interface GridDisplayProps {
  grid: Grid;
  enemies: Enemy[];
  selectedPath: Position[];
  activePowerUpMode: ActivePowerUpMode;
  teleportFirstTile: Position | null;
  onTileInteraction: (r: number, c: number, type: 'down' | 'enter' | 'up') => void;
  onMouseUpGlobal: () => void; // Added for ending drag sequence
}

const GridDisplay: React.FC<GridDisplayProps> = ({ grid, enemies, selectedPath, activePowerUpMode, teleportFirstTile, onTileInteraction, onMouseUpGlobal }) => {
  
  const handleMouseUp = () => {
    // This function will be called when mouse is released ANYWHERE on the grid or even outside if captured.
    // The main logic for 'up' interaction type is passed via onTileInteraction and typically handled in useGameLogic.
    onMouseUpGlobal(); 
  };
  
  const gridItems = grid.flatMap((row, r) =>
    row.map((tile, c) => tile ? { ...tile, r, c } : null)
  ).filter(Boolean);

  const transitions = useTransition(gridItems, {
    keys: (item) => item!.id,
    from: { opacity: 0, transform: 'translateY(-100%) scale(0.5)' },
    enter: { opacity: 1, transform: 'translateY(0%) scale(1)' },
    leave: { opacity: 0, transform: 'scale(0)' },
    trail: 15,
    config: { tension: 250, friction: 20 }
  });

  return (
    <div
      className="relative grid gap-1 sm:gap-2 p-2 sm:p-4 bg-slate-700 rounded-lg shadow-xl"
      style={{
        gridTemplateRows: `repeat(${grid.length}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${grid[0]?.length || 0}, minmax(0, 1fr))`,
      }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {Array.from({ length: grid.length * grid[0].length }).map((_, i) => (
        <div key={i} className="w-full aspect-square" />
      ))}

      {transitions((style, item) => {
        const r = item!.r; const c = item!.c;
        const position = { r, c };
        const enemyOnTile = enemies.find(e => e.r === r && e.c === c) || null;
        const isSelected = selectedPath.some(p => p.r === r && p.c === c);
        const isPathEnd = isSelected && selectedPath.length > 0 && selectedPath[selectedPath.length-1].r === r && selectedPath[selectedPath.length-1].c === c;

        let isTeleportTargetVisual = false;
        if (activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_1 && item) {
          isTeleportTargetVisual = true;
        } else if (activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_2 && item && teleportFirstTile && (r !== teleportFirstTile.r || c !== teleportFirstTile.c)) {
          isTeleportTargetVisual = true;
        }

        return (
          <animated.div
            key={item!.id}
            className="absolute"
            style={{
              ...style,
              top: `${r * 100 / grid.length}%`,
              left: `${c * 100 / grid[0].length}%`,
              width: `calc(100% / ${grid[0].length})`,
              height: `calc(100% / ${grid.length})`
            }}
            onMouseDown={() => {
              playSound(SoundType.PATH_SELECT);
              onTileInteraction(r, c, 'down');
            }}
            onMouseEnter={() => onTileInteraction(r, c, 'enter')}
          >
            <TileDisplay
              tile={item}
              position={position}
              enemyOnTile={enemyOnTile}
              isSelected={isSelected}
              isPathEnd={isPathEnd}
              isTeleportTarget={isTeleportTargetVisual}
              onInteraction={onTileInteraction}
            />
          </animated.div>
        );
      })}
    </div>
  );
};

export default GridDisplay;
