
import { useState, useEffect, useCallback } from 'react';
import { Tile, Grid, Position, PowerUp, PowerUpType, Enemy, Mission, GameOverReason, ActivePowerUpMode, GameStats } from '../types';
import { 
  GRID_ROWS, GRID_COLS, INITIAL_ENERGY, POWERUP_AWARD_CHAIN_LENGTH, ENEMY_TARGET_R, ENEMY_TARGET_C, 
  PREDEFINED_MISSIONS, ENEMY_SPAWN_INTERVAL_TURNS, MAX_ENEMIES, AVAILABLE_POWERUPS,
  ENERGY_COST_PER_MERGE, ENERGY_BONUS_PER_5_CHAIN, SCORE_PER_TILE_VALUE_MERGED, ENEMY_DESTRUCTION_CHAIN_LENGTH, TILE_COOLDOWN_TURNS
} from '../constants';
import { initializeGrid, applyGravityAndSpawn, validatePath, createNewTile, isAdjacent, isValidCoordinate, hasAnyValidMerge, processMerge, generateId } from '../utils/gridUtils';

const useGameLogic = () => {
  const [grid, setGrid] = useState<Grid>(initializeGrid());
  const [energy, setEnergy] = useState<number>(INITIAL_ENERGY);
  const [score, setScore] = useState<number>(0);
  const [turn, setTurn] = useState<number>(0);
  
  const selectNewMission = useCallback(() => {
    // setCurrentMission will be defined later, this is just to satisfy ESLint temporarily if it complains.
    // Real logic for selectNewMission relies on currentMission.id
    const newMissionIndex = Math.floor(Math.random() * PREDEFINED_MISSIONS.length);
    const newMission = PREDEFINED_MISSIONS[newMissionIndex];
    // This is a simplified version; proper version needs to avoid currentMission.id
    setCurrentMission({...newMission, progress: 0, isCompleted: false });
  }, []);


  const [currentMission, setCurrentMission] = useState<Mission>(() => {
      const initialMission = PREDEFINED_MISSIONS[Math.floor(Math.random() * PREDEFINED_MISSIONS.length)];
      return {...initialMission, progress: 0, isCompleted: false};
  });
  const [availablePowerUps, setAvailablePowerUps] = useState<PowerUp[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  
  const [selectedPath, setSelectedPath] = useState<Position[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<GameOverReason | null>(null);

  const [activePowerUpMode, setActivePowerUpMode] = useState<ActivePowerUpMode>(ActivePowerUpMode.NONE);
  const [isDoublerActive, setIsDoublerActive] = useState<boolean>(false);
  const [teleportFirstTile, setTeleportFirstTile] = useState<Position | null>(null);
  const [shoveEnemySource, setShoveEnemySource] = useState<Position | null>(null);

  const [gameStats, setGameStats] = useState<GameStats>({
    mergesMade: 0, tilesSpawned: GRID_ROWS * GRID_COLS, powerUpsUsed: 0, enemiesDefeated: 0, maxChainLength: 0, highestTileValue: 0
  });


  const updateStats = useCallback((updates: Partial<GameStats>) => {
    setGameStats(prev => ({...prev, ...updates}));
  }, []);

  const internalSelectNewMission = useCallback(() => {
    setCurrentMission(prevMission => {
        const availableMissions = PREDEFINED_MISSIONS.filter(m => m.id !== prevMission.id);
        const newMission = availableMissions.length > 0 
          ? availableMissions[Math.floor(Math.random() * availableMissions.length)]
          : PREDEFINED_MISSIONS[0]; 
        return {...newMission, progress: 0, isCompleted: false };
    });
  }, []);

  const checkMissionCompletion = useCallback((
    updatedGrid: Grid,
    mergedValueOutput?: { value: number, isDoubled: boolean }, // Pass object for clarity
    chainLength?: number,
    chainValues?: number[],
    numEnemiesDestroyedThisTurn?: number,
    numEnemiesStunnedThisTurn?: number
  ) => {
    setCurrentMission(prevMission => {
        if (prevMission.isCompleted) return prevMission;

        let completed = false;
        let newProgress = prevMission.progress;
        const { target } = prevMission;

        if (target.value && target.count) {
            let count = 0;
            updatedGrid.flat().forEach(tile => {
                if (tile && tile.value === target.value) count++;
            });
            newProgress = count;
            if (count >= target.count) completed = true;
        } else if (target.chainLength && chainLength && chainLength >= target.chainLength) {
            if (target.chainValueProperty && chainValues) {
                const propertyMet = chainValues.every(val => 
                    target.chainValueProperty === 'even' ? val % 2 === 0 : val % 2 !== 0
                );
                if (propertyMet) completed = true;
            } else if (!target.chainValueProperty) {
                completed = true;
            }
            if(completed) newProgress = chainLength;
        } else if (target.scoreInMerge && mergedValueOutput && mergedValueOutput.value >= target.scoreInMerge) {
            completed = true;
            newProgress = mergedValueOutput.value;
        } else if (target.enemiesDestroyed && numEnemiesDestroyedThisTurn && numEnemiesDestroyedThisTurn > 0) {
            newProgress = (prevMission.progress || 0) + numEnemiesDestroyedThisTurn;
            if (newProgress >= target.enemiesDestroyed) completed = true;
        } else if (target.enemiesStunned && numEnemiesStunnedThisTurn && numEnemiesStunnedThisTurn > 0) {
            newProgress = (prevMission.progress || 0) + numEnemiesStunnedThisTurn;
            if (newProgress >= target.enemiesStunned) completed = true;
        }

        if (completed) {
          setScore(s => s + (prevMission.reward.score || 0));
          setEnergy(e => e + (prevMission.reward.energy || 0));
          if (prevMission.reward.powerUp) {
            setAvailablePowerUps(prevPUs => [...prevPUs, { id: generateId(), type: prevMission.reward.powerUp! }]);
          }
          setTimeout(internalSelectNewMission, 2000); // Select new mission after a short delay
          return { ...prevMission, progress: newProgress, isCompleted: true };
        }
        return { ...prevMission, progress: newProgress };
    });
  }, [internalSelectNewMission, updateStats]);


  const awardPowerUp = useCallback((chainLength: number) => {
    if (chainLength >= POWERUP_AWARD_CHAIN_LENGTH) {
      const randomPowerUpType = AVAILABLE_POWERUPS[Math.floor(Math.random() * AVAILABLE_POWERUPS.length)];
      setAvailablePowerUps(prev => [...prev, { id: generateId(), type: randomPowerUpType }]);
    }
  }, []);

  const decrementCooldowns = useCallback((currentGrid: Grid): Grid => {
    return currentGrid.map(row => 
      row.map(tile => 
        tile && tile.cooldown > 0 ? { ...tile, cooldown: tile.cooldown - 1 } : tile
      )
    );
  }, []);
  
  const moveAndSpawnEnemies = useCallback((currentGrid: Grid, currentEnemies: Enemy[], currentTurn: number): Enemy[] => {
    let enemiesAfterMove = [...currentEnemies];

    // Decrement stun counters before moving
    let newMovedEnemies = enemiesAfterMove.map(enemy => {
        if (enemy.stunnedForTurns && enemy.stunnedForTurns > 0) {
            return { ...enemy, stunnedForTurns: enemy.stunnedForTurns - 1 };
        }
        return enemy;
    });

    enemiesAfterMove = newMovedEnemies;

    newMovedEnemies = enemiesAfterMove.map(enemy => {
      if ((enemy.r === ENEMY_TARGET_R && enemy.c === ENEMY_TARGET_C) || (enemy.stunnedForTurns && enemy.stunnedForTurns > 0)) return enemy;

      let dr = Math.sign(ENEMY_TARGET_R - enemy.r);
      let dc = Math.sign(ENEMY_TARGET_C - enemy.c);
      
      let newR = enemy.r + dr;
      let newC = enemy.c + dc;

      if (isValidCoordinate(newR, newC)) {
        const isOccupiedByOtherEnemy = enemiesAfterMove.some(otherEnemy => 
            otherEnemy.id !== enemy.id && otherEnemy.r === newR && otherEnemy.c === newC
        );
        const targetTile = currentGrid[newR][newC];
        if(!isOccupiedByOtherEnemy && (!targetTile || !targetTile.blocked)) { 
            return { ...enemy, r: newR, c: newC };
        }
      }
      return enemy; 
    });
    
    enemiesAfterMove = newMovedEnemies;

    if (currentTurn > 0 && currentTurn % ENEMY_SPAWN_INTERVAL_TURNS === 0 && enemiesAfterMove.length < MAX_ENEMIES) {
      const availableSpawnPositions: Position[] = [];
      const spawnPriorities: Position[] = [
          {r: GRID_ROWS -1, c: 0}, {r: GRID_ROWS -1, c: GRID_COLS -1},
      ];
      for(let c=1; c < GRID_COLS -1; c++) spawnPriorities.push({r: GRID_ROWS -1, c});

      for (const pos of spawnPriorities) {
         if (!enemiesAfterMove.some(e => e.r === pos.r && e.c === pos.c) && (!currentGrid[pos.r][pos.c] || !currentGrid[pos.r][pos.c]?.blocked)) {
             availableSpawnPositions.push(pos);
         }
      }
      
      if(availableSpawnPositions.length === 0) {
        for (let r_spawn = GRID_ROWS - 1; r_spawn >= 0; r_spawn--) { // Try any row if bottom is full
            for (let c_spawn = 0; c_spawn < GRID_COLS; c_spawn++) {
                const LAST_ROW_INDEX = GRID_ROWS - 1;
                const C_EDGE_LEFT = 0;
                const C_EDGE_RIGHT = GRID_COLS - 1;
                //Prioritize edges if not bottom row
                if(r_spawn < LAST_ROW_INDEX && !(c_spawn === C_EDGE_LEFT || c_spawn === C_EDGE_RIGHT)) continue;

                if (!enemiesAfterMove.some(e => e.r === r_spawn && e.c === c_spawn) && (!currentGrid[r_spawn][c_spawn] || !currentGrid[r_spawn][c_spawn]?.blocked) ) {
                  availableSpawnPositions.push({r: r_spawn, c: c_spawn});
                }
            }
            if(availableSpawnPositions.length > 0 && r_spawn < (GRID_ROWS - 1)) break; // If found on edges of higher rows, good enough
        }
      }

      if (availableSpawnPositions.length > 0) {
        const spawnPos = availableSpawnPositions[Math.floor(Math.random() * availableSpawnPositions.length)];
        enemiesAfterMove.push({ id: generateId(), r: spawnPos.r, c: spawnPos.c });
      }
    }
    return enemiesAfterMove;
  }, []); 


  const checkGameOverState = useCallback((currentEnergy: number, currentGrid: Grid, currentEnemies: Enemy[]) => {
    if (currentEnergy <= 0) {
      setGameOverReason(GameOverReason.NO_ENERGY);
      return true;
    }
    if (currentEnemies.some(e => e.r === ENEMY_TARGET_R && e.c === ENEMY_TARGET_C)) {
      setGameOverReason(GameOverReason.ENEMY_AT_CENTER);
      return true;
    }
    if (!hasAnyValidMerge(currentGrid)) { 
      setGameOverReason(GameOverReason.NO_VALID_MERGES);
      return true;
    }
    return false;
  }, []);

  const advanceTurn = useCallback(
        (
        processedGrid: Grid,
        newEnergy: number,
        newScore: number,
        mergeDetails?: { chainLength: number, mergedValue: number, chainValues: number[], scoreFromMerge: number },
        enemiesDestroyedThisMerge?: number,
        enemiesStunnedThisMerge?: number,
        currentEnemiesOverride?: Enemy[]
    ) => {

    let gridAfterCooldowns = decrementCooldowns(processedGrid);
    const baseEnemies = currentEnemiesOverride ?? enemies;
    let updatedEnemies = moveAndSpawnEnemies(gridAfterCooldowns, baseEnemies, turn + 1); // Pass next turn for spawn logic

    setGrid(gridAfterCooldowns);
    setEnemies(updatedEnemies);
    setEnergy(newEnergy);
    setScore(newScore);
    setTurn(t => t + 1);
    
    if (mergeDetails) {
        updateStats({
            mergesMade: gameStats.mergesMade + 1,
            maxChainLength: Math.max(gameStats.maxChainLength, mergeDetails.chainLength),
            highestTileValue: Math.max(gameStats.highestTileValue, mergeDetails.mergedValue),
        });
        if (enemiesDestroyedThisMerge && enemiesDestroyedThisMerge > 0) {
            updateStats({enemiesDefeated: gameStats.enemiesDefeated + enemiesDestroyedThisMerge});
        }
        checkMissionCompletion(gridAfterCooldowns, { value: mergeDetails.scoreFromMerge, isDoubled: isDoublerActive }, mergeDetails.chainLength, mergeDetails.chainValues, enemiesDestroyedThisMerge, enemiesStunnedThisMerge);
        awardPowerUp(mergeDetails.chainLength);
    } else { // For power-up usage or other non-merge turn advances
        checkMissionCompletion(gridAfterCooldowns, undefined, undefined, undefined, enemiesDestroyedThisMerge, enemiesStunnedThisMerge);
    }
    

    setIsDoublerActive(false); // Reset doubler after turn advances (if it was used)
    
    // Game over check should be the very last thing after all state updates for the turn
    // Need to pass the *final* state of grid, energy, enemies for this turn
    // setTimeout to allow React to process state updates before checking game over
    setTimeout(() => {
        setGrid(g => { // Read latest grid state
            setEnergy(e => { // Read latest energy
                setEnemies(ens => { // Read latest enemies
                    checkGameOverState(e, g, ens);
                    return ens;
                });
                return e;
            });
            return g;
        });
    }, 0);

  }, [decrementCooldowns, moveAndSpawnEnemies, enemies, turn, gameStats.mergesMade, gameStats.maxChainLength, gameStats.highestTileValue, gameStats.enemiesDefeated, checkMissionCompletion, awardPowerUp, isDoublerActive, checkGameOverState, updateStats]);


  const handleTileInteraction = useCallback((r: number, c: number, interactionType: 'down' | 'enter' | 'up') => {
    if (gameOverReason) return;

    if (activePowerUpMode === ActivePowerUpMode.BOMB_TARGETING) {
        if (interactionType === 'down') {
            const targetPos = {r, c};
            let newGrid = JSON.parse(JSON.stringify(grid)) as Grid;
            const affectedCells: Position[] = []; 
            
            for(let dr_bomb = -1; dr_bomb <= 1; dr_bomb++) {
                for(let dc_bomb = -1; dc_bomb <= 1; dc_bomb++) {
                    const adjR = targetPos.r + dr_bomb;
                    const adjC = targetPos.c + dc_bomb;
                    if(isValidCoordinate(adjR, adjC)) {
                       affectedCells.push({r: adjR, c: adjC});
                    }
                }
            }
            
            let enemiesDestroyedCount = 0;
            let currentEnemies = [...enemies]; // Work on a copy before setting state

            affectedCells.forEach(pos => {
                newGrid[pos.r][pos.c] = null; 
                const enemyIndex = currentEnemies.findIndex(en => en.r === pos.r && en.c === pos.c);
                if (enemyIndex !== -1) {
                    currentEnemies = currentEnemies.filter((_, idx) => idx !== enemyIndex);
                    enemiesDestroyedCount++;
                }
            });
            setEnemies(currentEnemies);


            let gridAfterGravity = applyGravityAndSpawn(newGrid);
            
            setActivePowerUpMode(ActivePowerUpMode.NONE);
            updateStats({powerUpsUsed: gameStats.powerUpsUsed + 1});

            advanceTurn(
                gridAfterGravity,
                energy - ENERGY_COST_PER_MERGE, // Bomb costs energy
                score,
                undefined,
                enemiesDestroyedCount,
                undefined,
                currentEnemies
            );
        }
        return;
    }

    if (activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_1) {
        if (interactionType === 'down' && grid[r][c]) {
            setTeleportFirstTile({r,c});
            setActivePowerUpMode(ActivePowerUpMode.TELEPORT_SELECT_2);
        }
        return;
    }
    if (activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_2 && teleportFirstTile) {
        if (interactionType === 'down' && grid[r][c] && (r !== teleportFirstTile.r || c !== teleportFirstTile.c)) {
            const pos1 = teleportFirstTile;
            const pos2 = {r,c};
            let newGrid = JSON.parse(JSON.stringify(grid)) as Grid;
            const tile1 = newGrid[pos1.r][pos1.c];
            const tile2 = newGrid[pos2.r][pos2.c];

            // Swap tiles, ensuring their r,c properties are also updated
            newGrid[pos1.r][pos1.c] = tile2 ? {...tile2, r: pos1.r, c: pos1.c} : null;
            newGrid[pos2.r][pos2.c] = tile1 ? {...tile1, r: pos2.r, c: pos2.c} : null;

            // Move any enemies occupying these tiles as well
            let updatedEnemies = [...enemies];
            updatedEnemies = updatedEnemies.map(en => {
                if (en.r === pos1.r && en.c === pos1.c) return { ...en, r: pos2.r, c: pos2.c };
                if (en.r === pos2.r && en.c === pos2.c) return { ...en, r: pos1.r, c: pos1.c };
                return en;
            });
            setEnemies(updatedEnemies);

            setActivePowerUpMode(ActivePowerUpMode.NONE);
            setTeleportFirstTile(null);
            updateStats({powerUpsUsed: gameStats.powerUpsUsed + 1});
            advanceTurn(
                newGrid,
                energy - ENERGY_COST_PER_MERGE, // Teleport costs energy
                score,
                undefined,
                undefined,
                undefined,
                updatedEnemies
            );
        }
        return;
    }

    if (activePowerUpMode === ActivePowerUpMode.SHOVE_SELECT_1) {
        if (interactionType === 'down' && enemies.some(e => e.r === r && e.c === c)) {
            setShoveEnemySource({r,c});
            setActivePowerUpMode(ActivePowerUpMode.SHOVE_SELECT_2);
        }
        return;
    }
    if (activePowerUpMode === ActivePowerUpMode.SHOVE_SELECT_2 && shoveEnemySource) {
        if (interactionType === 'down') {
            const sourcePos = shoveEnemySource;
            const targetPos = {r, c};
            const dr = targetPos.r - sourcePos.r;
            const dc = targetPos.c - sourcePos.c;

            if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr !== 0 || dc !== 0) && isValidCoordinate(r,c) && !grid[r][c] && !enemies.some(e => e.r === r && e.c === c)) {
                let updatedEnemies = enemies.map(en => {
                    if (en.r === sourcePos.r && en.c === sourcePos.c) {
                        return { ...en, r: targetPos.r, c: targetPos.c };
                    }
                    return en;
                });

                setActivePowerUpMode(ActivePowerUpMode.NONE);
                setShoveEnemySource(null);
                updateStats({powerUpsUsed: gameStats.powerUpsUsed + 1});
                advanceTurn(
                    grid,
                    energy,
                    score,
                    undefined,
                    undefined,
                    undefined,
                    updatedEnemies
                );
            }
        }
        return;
    }


    if (interactionType === 'down') {
      const tile = grid[r][c];
      if (tile && tile.cooldown === 0 && !tile.blocked && activePowerUpMode === ActivePowerUpMode.NONE) {
        setIsDragging(true);
        setSelectedPath([{ r, c }]);
      } else {
        setIsDragging(false); // ensure dragging is false if not a valid start
        setSelectedPath([]); 
      }
    } else if (interactionType === 'enter' && isDragging) {
      if (selectedPath.length > 0) {
        const lastPos = selectedPath[selectedPath.length - 1];
        const currentPos = {r,c};
        // Check if current tile is same value, not on cooldown, not blocked, adjacent to last, and not already in path (except for allowing to drag back to previous)
        const currentTile = grid[r][c];
        const firstTileInPath = grid[selectedPath[0].r][selectedPath[0].c];

        if (currentTile && currentTile.value === firstTileInPath?.value && currentTile.cooldown === 0 && !currentTile.blocked && isAdjacent(lastPos, currentPos)) {
            const existingIndex = selectedPath.findIndex(p => p.r === r && p.c === c);
            if (existingIndex === -1) { // Not in path yet
                 setSelectedPath(prev => [...prev, currentPos]);
            } else if (existingIndex === selectedPath.length - 2) { // Dragging back to previous tile
                 setSelectedPath(prev => prev.slice(0, -1));
            }
        }
      }
    } else if (interactionType === 'up') {
      if (isDragging && selectedPath.length > 0) {
        if (validatePath(grid, selectedPath)) {
          const { newGrid: gridAfterMerge, mergedValue, scoreEarned } = processMerge(grid, selectedPath, isDoublerActive);
          
          let enemiesDestroyedCount = 0;
          let enemiesStunnedCount = 0;
          let currentEnemies = [...enemies];

          // Remove enemies that occupy any tile in the merge path
          selectedPath.forEach(pos => {
            const idx = currentEnemies.findIndex(en => en.r === pos.r && en.c === pos.c);
            if (idx !== -1) {
              currentEnemies.splice(idx, 1);
              enemiesDestroyedCount++;
            }
          });

          // Additional destruction for long chains
          if (selectedPath.length >= ENEMY_DESTRUCTION_CHAIN_LENGTH) {
            const lastMergedTilePos = selectedPath[selectedPath.length -1];
            for (let dr_enemy = -1; dr_enemy <= 1; dr_enemy++) {
                for (let dc_enemy = -1; dc_enemy <=1; dc_enemy++) {
                    if (dr_enemy === 0 && dc_enemy === 0) continue; // skip merge tile itself
                    const adjR = lastMergedTilePos.r + dr_enemy;
                    const adjC = lastMergedTilePos.c + dc_enemy;
                    if (isValidCoordinate(adjR, adjC)) {
                        const eIdx = currentEnemies.findIndex(en => en.r === adjR && en.c === adjC);
                        if (eIdx !== -1) {
                            currentEnemies.splice(eIdx, 1);
                            enemiesDestroyedCount++;
                        }
                    }
                }
            }
          }

          // Stun adjacent enemies for chains of length >= 4
          if (selectedPath.length >= 4) {
            const lastMergedTilePos = selectedPath[selectedPath.length -1];
            for (let dr_stun = -1; dr_stun <= 1; dr_stun++) {
                for (let dc_stun = -1; dc_stun <= 1; dc_stun++) {
                    if (dr_stun === 0 && dc_stun === 0) continue;
                    const adjR = lastMergedTilePos.r + dr_stun;
                    const adjC = lastMergedTilePos.c + dc_stun;
                    if (isValidCoordinate(adjR, adjC)) {
                        const eIdx = currentEnemies.findIndex(en => en.r === adjR && en.c === adjC);
                        if (eIdx !== -1) {
                           const curr = currentEnemies[eIdx];
                           currentEnemies[eIdx] = { ...curr, stunnedForTurns: 2 };
                           enemiesStunnedCount++;
                        }
                    }
                }
            }
          }

          if(enemiesDestroyedCount > 0 || enemiesStunnedCount > 0) setEnemies(currentEnemies);


          const gridAfterGravity = applyGravityAndSpawn(gridAfterMerge);
          
          const newEnergy = energy - ENERGY_COST_PER_MERGE + Math.floor(selectedPath.length / ENERGY_BONUS_PER_5_CHAIN);
          const newScore = score + scoreEarned;
          
          const chainValues = selectedPath.map(p => grid[p.r][p.c]!.value);

          advanceTurn(
            gridAfterGravity,
            newEnergy,
            newScore,
            { chainLength: selectedPath.length, mergedValue, chainValues, scoreFromMerge: scoreEarned },
            enemiesDestroyedCount,
            enemiesStunnedCount,
            currentEnemies
          );

        }
      }
      setIsDragging(false);
      setSelectedPath([]);
    }
  }, [grid, isDragging, selectedPath, gameOverReason, activePowerUpMode, teleportFirstTile, shoveEnemySource, energy, score, enemies, isDoublerActive, advanceTurn, gameStats.powerUpsUsed, updateStats]);


  const activatePowerUp = useCallback((id: string) => {
    if (gameOverReason || activePowerUpMode !== ActivePowerUpMode.NONE) return;

    const powerUp = availablePowerUps.find(p => p.id === id);
    if (!powerUp) return;

    setAvailablePowerUps(prev => prev.filter(p => p.id !== id));

    switch (powerUp.type) {
      case PowerUpType.BOMB:
        setActivePowerUpMode(ActivePowerUpMode.BOMB_TARGETING);
        break;
      case PowerUpType.DOUBLER:
        setIsDoublerActive(true);
        // Doubler is passive, doesn't cost a turn or energy until a merge happens.
        // Stats for powerup used will be incremented when merge occurs with doubler
        updateStats({powerUpsUsed: gameStats.powerUpsUsed + 1}); // Or increment when merge happens? Let's do it on activation.
        break;
      case PowerUpType.TELEPORT:
        setActivePowerUpMode(ActivePowerUpMode.TELEPORT_SELECT_1);
        break;
      case PowerUpType.SHOVE:
        setActivePowerUpMode(ActivePowerUpMode.SHOVE_SELECT_1);
        break;
    }
  }, [availablePowerUps, gameOverReason, activePowerUpMode, gameStats.powerUpsUsed, updateStats]);

  const cancelPowerUp = useCallback(() => {
    setActivePowerUpMode(ActivePowerUpMode.NONE);
    setTeleportFirstTile(null);
    setShoveEnemySource(null);
    // If a power-up was consumed to enter targeting mode (e.g., Bomb, Teleport), it should be returned if cancelled.
    // However, the current logic removes it from availablePowerUps on activation.
    // For simplicity now, cancelling does not return the power-up. This can be changed if desired.
    // If doubler was activated and we want a cancel for it (though it's passive):
    // if(isDoublerActive) setIsDoublerActive(false); // and potentially return the powerup.
  }, []);

  const restartGame = useCallback(() => {
    setGrid(initializeGrid());
    setEnergy(INITIAL_ENERGY);
    setScore(0);
    setTurn(0);
    internalSelectNewMission(); // Use internalSelectNewMission to ensure fresh mission state
    setAvailablePowerUps([]);
    setEnemies([]);
    setSelectedPath([]);
    setIsDragging(false);
    setGameOverReason(null);
    setActivePowerUpMode(ActivePowerUpMode.NONE);
    setIsDoublerActive(false);
    setTeleportFirstTile(null);
    setShoveEnemySource(null);
    setGameStats({
        mergesMade: 0, tilesSpawned: GRID_ROWS * GRID_COLS, powerUpsUsed: 0, enemiesDefeated: 0, maxChainLength: 0, highestTileValue: 0
    });
  }, [internalSelectNewMission]);

  // Initial game over check in case the initial grid has no moves (highly unlikely with random gen)
  useEffect(() => {
    if (turn === 0) { // Only on initial load
        // Ensure cooldowns are initially 0 for all tiles from initializeGrid
        const initialGridWithZeroCooldowns = grid.map(row => row.map(tile => tile ? {...tile, cooldown: 0} : null));
        if (!hasAnyValidMerge(initialGridWithZeroCooldowns)) {
            setGameOverReason(GameOverReason.NO_VALID_MERGES);
        }
    }
  }, []); // Runs once on mount


  return {
    grid, energy, score, turn, currentMission, availablePowerUps, enemies,
    selectedPath, isDragging, gameOverReason, gameStats,
    activePowerUpMode, isDoublerActive, teleportFirstTile,
    handleTileInteraction, activatePowerUp, cancelPowerUp, restartGame
  };
};

export default useGameLogic;
