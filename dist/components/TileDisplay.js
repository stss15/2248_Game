import React from 'react';
import { getTileColors } from '../utils/theme.js';
import { ENEMY_TARGET_R, ENEMY_TARGET_C } from '../constants.js';
const TileDisplay = ({ tile, position, enemyOnTile, isSelected, isPathEnd, isTeleportTarget, onInteraction }) => {
    const handleMouseDown = () => onInteraction(position.r, position.c, 'down');
    const handleMouseEnter = () => onInteraction(position.r, position.c, 'enter');
    // onMouseUp is typically handled globally in the parent component (GridDisplay or App)
    const tileValue = tile?.value;
    const cooldown = tile?.cooldown || 0;
    const tileClasses = getTileColors(tileValue ?? 0, cooldown, !!enemyOnTile, isSelected, isPathEnd);
    const displayValue = tileValue !== null && tileValue !== undefined ? tileValue : '';
    const isCenterCell = position.r === ENEMY_TARGET_R && position.c === ENEMY_TARGET_C;
    return (React.createElement("div", { className: `w-full aspect-square ${tileClasses} ${isTeleportTarget ? 'ring-4 ring-green-400 animate-pulse' : ''} ${isCenterCell && !enemyOnTile ? 'bg-opacity-50 border-dashed border-sky-400' : ''}`, onMouseDown: handleMouseDown, onMouseEnter: handleMouseEnter, role: "button", "aria-label": `Tile at ${position.r}, ${position.c} with value ${displayValue}`, tabIndex: 0 },
        enemyOnTile && (React.createElement("span", { className: "absolute text-3xl animate-bounce z-10", role: "img", "aria-label": "Enemy" }, "\uD83D\uDC80")),
        cooldown > 0 && !enemyOnTile && (React.createElement("div", { className: "absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg z-20" },
            React.createElement("span", { className: "text-white text-xl font-bold font-mono" }, cooldown))),
        tile && !enemyOnTile && (React.createElement("span", { className: `tile-value-display ${tile.value >= 1000 ? 'text-sm' : tile.value >= 100 ? 'text-base' : 'text-xl'}` }, displayValue)),
        isCenterCell && !tile && !enemyOnTile && (React.createElement("span", { className: "text-sky-300 text-3xl font-bold opacity-50" }, "\uD83C\uDFAF"))));
};
export default TileDisplay;
