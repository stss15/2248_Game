
import React from 'react';
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
  
  return (
    <div
      className="grid gap-1 sm:gap-2 p-2 sm:p-4 bg-slate-700 rounded-lg shadow-xl"
      style={{
        gridTemplateRows: `repeat(${grid.length}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${grid[0]?.length || 0}, minmax(0, 1fr))`,
      }}
      onMouseUp={handleMouseUp} // Capture mouse up on the grid container
      onMouseLeave={handleMouseUp} // Also end drag if mouse leaves grid
    >
      {grid.map((row, r) =>
        row.map((tile, c) => {
          const position = { r, c };
          const enemyOnTile = enemies.find(enemy => enemy.r === r && enemy.c === c) || null;
          const isSelected = selectedPath.some(p => p.r === r && p.c === c);
          const isPathEnd = isSelected && selectedPath.length > 0 && selectedPath[selectedPath.length-1].r === r && selectedPath[selectedPath.length-1].c === c;
          
          let isTeleportTargetVisual = false;
          if (activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_1 && tile) {
            isTeleportTargetVisual = true; // Highlight all valid tiles for first selection
          } else if (activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_2 && tile && teleportFirstTile && (r !== teleportFirstTile.r || c !== teleportFirstTile.c)) {
             isTeleportTargetVisual = true; // Highlight valid second selection tiles
          }


          return (
            <TileDisplay
              key={`${r}-${c}-${tile?.id || 'empty'}`}
              tile={tile}
              position={position}
              enemyOnTile={enemyOnTile}
              isSelected={isSelected}
              isPathEnd={isPathEnd}
              isTeleportTarget={isTeleportTargetVisual}
              onInteraction={onTileInteraction}
            />
          );
        })
      )}
    </div>
  );
};

export default GridDisplay;
