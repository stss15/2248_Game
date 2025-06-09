
import React, { useRef, useEffect, useCallback } from 'react';
import useGameLogic from './hooks/useGameLogic';
import GridDisplay from './components/GridDisplay';
import HudDisplay from './components/HudDisplay';
import GameOverModal from './components/GameOverModal';
import { ActivePowerUpMode } from './types';
import { playSound, SoundType } from './stss15/2248_game/2248_Game-74ed77f2104396e53c5e5922c2c05249a5efd651/utils/audioManager';

const App: React.FC = () => {
  const {
    grid, energy, score, turn, currentMission, availablePowerUps, enemies,
    selectedPath, isDragging, gameOverReason, gameStats,
    activePowerUpMode, isDoublerActive, teleportFirstTile,
    handleTileInteraction, activatePowerUp, cancelPowerUp, restartGame
  } = useGameLogic();

  const prevMergesMade = useRef(gameStats.mergesMade);
  const prevPowerUps = useRef(availablePowerUps.length);

  const handleGlobalMouseUp = () => {
    // If dragging, finalize path. This will call the 'up' interaction.
    // The `useGameLogic`'s `handleTileInteraction` for 'up' type handles this.
    // We just need to ensure it's called if mouse is released anywhere.
    // If selectedPath has items, it means a drag was in progress.
    if (isDragging && selectedPath.length > 0) {
      // The last tile in path doesn't matter for 'up', it just signals end of drag.
      const lastPos = selectedPath[selectedPath.length-1];
      handleTileInteraction(lastPos.r, lastPos.c, 'up');
    } else if (isDragging) { // Dragged but no valid path selected
       handleTileInteraction(0,0,'up'); // Call with dummy coords to reset drag state
    }
  };

  let cursorStyle = 'cursor-default';
  if (isDragging) {
    cursorStyle = 'cursor-grabbing';
  } else if (activePowerUpMode === ActivePowerUpMode.BOMB_TARGETING || activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_1 || activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_2) {
    cursorStyle = 'cursor-crosshair';
  }

  useEffect(() => {
    if (gameStats.mergesMade > prevMergesMade.current) {
      playSound(SoundType.MERGE);
    }
    prevMergesMade.current = gameStats.mergesMade;
  }, [gameStats.mergesMade]);

  useEffect(() => {
    if (availablePowerUps.length > prevPowerUps.current) {
      playSound(SoundType.POWERUP_APPEAR);
    }
    prevPowerUps.current = availablePowerUps.length;
  }, [availablePowerUps]);

  useEffect(() => {
    if (gameOverReason) {
      playSound(SoundType.GAME_OVER);
    }
  }, [gameOverReason]);

  const handleActivatePowerUp = useCallback((id: string) => {
    const pu = availablePowerUps.find(p => p.id === id);
    if (pu?.type === 'BOMB') {
      playSound(SoundType.BOMB);
    }
    activatePowerUp(id);
  }, [activatePowerUp, availablePowerUps]);


  return (
    <div className={`flex flex-col md:flex-row items-start justify-center gap-4 p-2 md:p-6 w-full max-w-screen-lg mx-auto ${cursorStyle}`} onMouseUp={handleGlobalMouseUp}>
      <div className="w-full md:w-auto"> {/* Grid container */}
        <GridDisplay
          grid={grid}
          enemies={enemies}
          selectedPath={selectedPath}
          activePowerUpMode={activePowerUpMode}
          teleportFirstTile={teleportFirstTile}
          onTileInteraction={handleTileInteraction}
          onMouseUpGlobal={() => { /* This specific prop on GridDisplay can be removed if global works well */}}
        />
         { selectedPath.length > 0 && grid[selectedPath[0].r][selectedPath[0].c] && (
            <div className="mt-2 p-2 bg-slate-700 rounded text-center text-white">
                Selected: {grid[selectedPath[0].r][selectedPath[0].c]?.value} x {selectedPath.length} = { (grid[selectedPath[0].r][selectedPath[0].c]?.value ?? 0) * selectedPath.length * (isDoublerActive ? 2 : 1) }
            </div>
         )}
      </div>

      <HudDisplay
        score={score}
        energy={energy}
        turn={turn}
        mission={currentMission}
        availablePowerUps={availablePowerUps}
        gameStats={gameStats}
        isDoublerActive={isDoublerActive}
        activePowerUpMode={activePowerUpMode}
        onActivatePowerUp={handleActivatePowerUp}
        onCancelPowerUp={cancelPowerUp}
      />

      <GameOverModal reason={gameOverReason} score={score} gameStats={gameStats} onRestart={restartGame} />
    </div>
  );
};

export default App;
