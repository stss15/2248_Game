import React from 'react';
import { ActivePowerUpMode } from '../types.js';
import TileDisplay from './TileDisplay.js';
const GridDisplay = ({ grid, enemies, selectedPath, activePowerUpMode, teleportFirstTile, onTileInteraction, onMouseUpGlobal }) => {
    const handleMouseUp = () => {
        // This function will be called when mouse is released ANYWHERE on the grid or even outside if captured.
        // The main logic for 'up' interaction type is passed via onTileInteraction and typically handled in useGameLogic.
        onMouseUpGlobal();
    };
    return (React.createElement("div", { className: "grid gap-1 p-2 bg-slate-700 rounded-lg shadow-xl", style: {
            gridTemplateRows: `repeat(${grid.length}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${grid[0]?.length || 0}, minmax(0, 1fr))`,
        }, onMouseUp: handleMouseUp, onMouseLeave: handleMouseUp }, grid.map((row, r) => row.map((tile, c) => {
        const position = { r, c };
        const enemyOnTile = enemies.find(enemy => enemy.r === r && enemy.c === c) || null;
        const isSelected = selectedPath.some(p => p.r === r && p.c === c);
        const isPathEnd = isSelected && selectedPath.length > 0 && selectedPath[selectedPath.length - 1].r === r && selectedPath[selectedPath.length - 1].c === c;
        let isTeleportTargetVisual = false;
        if (activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_1 && tile) {
            isTeleportTargetVisual = true; // Highlight all valid tiles for first selection
        }
        else if (activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_2 && tile && teleportFirstTile && (r !== teleportFirstTile.r || c !== teleportFirstTile.c)) {
            isTeleportTargetVisual = true; // Highlight valid second selection tiles
        }
        return (React.createElement(TileDisplay, { key: `${r}-${c}-${tile?.id || 'empty'}`, tile: tile, position: position, enemyOnTile: enemyOnTile, isSelected: isSelected, isPathEnd: isPathEnd, isTeleportTarget: isTeleportTargetVisual, onInteraction: onTileInteraction }));
    }))));
};
export default GridDisplay;
