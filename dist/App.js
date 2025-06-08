import React from 'react';
import useGameLogic from './hooks/useGameLogic.js';
import GridDisplay from './components/GridDisplay.js';
import HudDisplay from './components/HudDisplay.js';
import GameOverModal from './components/GameOverModal.js';
import { ActivePowerUpMode } from './types.js';
const App = () => {
    const { grid, energy, score, turn, currentMission, availablePowerUps, enemies, selectedPath, isDragging, gameOverReason, gameStats, activePowerUpMode, isDoublerActive, teleportFirstTile, handleTileInteraction, activatePowerUp, cancelPowerUp, restartGame } = useGameLogic();
    const handleGlobalMouseUp = () => {
        // If dragging, finalize path. This will call the 'up' interaction.
        // The `useGameLogic`'s `handleTileInteraction` for 'up' type handles this.
        // We just need to ensure it's called if mouse is released anywhere.
        // If selectedPath has items, it means a drag was in progress.
        if (isDragging && selectedPath.length > 0) {
            // The last tile in path doesn't matter for 'up', it just signals end of drag.
            const lastPos = selectedPath[selectedPath.length - 1];
            handleTileInteraction(lastPos.r, lastPos.c, 'up');
        }
        else if (isDragging) { // Dragged but no valid path selected
            handleTileInteraction(0, 0, 'up'); // Call with dummy coords to reset drag state
        }
    };
    let cursorStyle = 'cursor-default';
    if (isDragging) {
        cursorStyle = 'cursor-grabbing';
    }
    else if (activePowerUpMode === ActivePowerUpMode.BOMB_TARGETING || activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_1 || activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_2) {
        cursorStyle = 'cursor-crosshair';
    }
    return (React.createElement("div", { className: `flex flex-col md:flex-row items-start justify-center gap-4 p-2 md:p-6 w-full max-w-screen-lg mx-auto ${cursorStyle}`, onMouseUp: handleGlobalMouseUp },
        React.createElement("div", { className: "w-full md:w-auto" },
            " ",
            React.createElement(GridDisplay, { grid: grid, enemies: enemies, selectedPath: selectedPath, activePowerUpMode: activePowerUpMode, teleportFirstTile: teleportFirstTile, onTileInteraction: handleTileInteraction, onMouseUpGlobal: () => { } }),
            selectedPath.length > 0 && grid[selectedPath[0].r][selectedPath[0].c] && (React.createElement("div", { className: "mt-2 p-2 bg-slate-700 rounded text-center text-white" },
                "Selected: ",
                grid[selectedPath[0].r][selectedPath[0].c]?.value,
                " x ",
                selectedPath.length,
                " = ",
                (grid[selectedPath[0].r][selectedPath[0].c]?.value ?? 0) * selectedPath.length * (isDoublerActive ? 2 : 1)))),
        React.createElement(HudDisplay, { score: score, energy: energy, turn: turn, mission: currentMission, availablePowerUps: availablePowerUps, gameStats: gameStats, isDoublerActive: isDoublerActive, activePowerUpMode: activePowerUpMode, onActivatePowerUp: activatePowerUp, onCancelPowerUp: cancelPowerUp }),
        React.createElement(GameOverModal, { reason: gameOverReason, score: score, gameStats: gameStats, onRestart: restartGame })));
};
export default App;
