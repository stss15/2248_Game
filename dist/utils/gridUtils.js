import { GRID_ROWS, GRID_COLS, INITIAL_TILE_VALUES, INITIAL_TILE_WEIGHTS, TILE_COOLDOWN_TURNS } from '../constants.js';
let nextIdCounter = 0;
export const generateId = () => `tile-${nextIdCounter++}`;
export const createNewTile = (r, c, value) => {
    let tileValue;
    if (value !== undefined) {
        tileValue = value;
    }
    else {
        const rand = Math.random();
        let cumulativeWeight = 0;
        let chosenValue = INITIAL_TILE_VALUES[INITIAL_TILE_VALUES.length - 1]; // Default to last if weights don't sum up or issue
        for (let i = 0; i < INITIAL_TILE_VALUES.length; i++) {
            cumulativeWeight += INITIAL_TILE_WEIGHTS[i];
            if (rand < cumulativeWeight) {
                chosenValue = INITIAL_TILE_VALUES[i];
                break;
            }
        }
        tileValue = chosenValue;
    }
    return { id: generateId(), r, c, value: tileValue, cooldown: 0, blocked: false };
};
export const initializeGrid = () => {
    const grid = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        grid[r] = [];
        for (let c = 0; c < GRID_COLS; c++) {
            grid[r][c] = createNewTile(r, c);
        }
    }
    return grid;
};
export const isAdjacent = (pos1, pos2) => {
    const dr = Math.abs(pos1.r - pos2.r);
    const dc = Math.abs(pos1.c - pos2.c);
    return dr <= 1 && dc <= 1 && (dr !== 0 || dc !== 0);
};
export const isValidCoordinate = (r, c) => {
    return r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS;
};
export const validatePath = (grid, path) => {
    if (path.length < 2)
        return false;
    const firstTile = grid[path[0].r][path[0].c];
    if (!firstTile)
        return false; // Should not happen if path is from selected tiles
    // Check all tiles in path exist, have same value, not on cooldown, and not blocked
    for (const pos of path) {
        const tile = grid[pos.r][pos.c];
        if (!tile || tile.value !== firstTile.value || tile.cooldown > 0 || tile.blocked) {
            return false;
        }
    }
    // Check adjacency for sequential tiles in path and no repeats
    const visited = new Set();
    visited.add(`${path[0].r}-${path[0].c}`);
    for (let i = 1; i < path.length; i++) {
        if (!isAdjacent(path[i - 1], path[i]))
            return false;
        const posKey = `${path[i].r}-${path[i].c}`;
        if (visited.has(posKey))
            return false; // No repeats
        visited.add(posKey);
    }
    return true;
};
export const applyGravityAndSpawn = (currentGrid) => {
    const newGrid = JSON.parse(JSON.stringify(currentGrid)); // Deep copy
    for (let c = 0; c < GRID_COLS; c++) {
        let emptyRow = GRID_ROWS - 1; // Start checking from bottom for empty spots
        for (let r = GRID_ROWS - 1; r >= 0; r--) {
            if (newGrid[r][c] !== null) {
                if (r !== emptyRow) {
                    // Move tile down
                    newGrid[emptyRow][c] = { ...newGrid[r][c], r: emptyRow, c: c };
                    newGrid[r][c] = null;
                }
                emptyRow--;
            }
        }
        // Spawn new tiles at the top for this column
        for (let r = emptyRow; r >= 0; r--) {
            newGrid[r][c] = createNewTile(r, c);
        }
    }
    return newGrid;
};
// Check if any valid merge of at least length 2 exists
export const hasAnyValidMerge = (grid) => {
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const tile = grid[r][c];
            if (tile && tile.cooldown === 0 && !tile.blocked) {
                // Check all 8 neighbours
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0)
                            continue;
                        const nr = r + dr;
                        const nc = c + dc;
                        if (isValidCoordinate(nr, nc)) {
                            const neighbor = grid[nr][nc];
                            if (neighbor && neighbor.value === tile.value && neighbor.cooldown === 0 && !neighbor.blocked) {
                                return true; // Found a pair that can merge
                            }
                        }
                    }
                }
            }
        }
    }
    return false;
};
export const processMerge = (currentGrid, path, isDoublerActive) => {
    if (path.length === 0)
        throw new Error("Path cannot be empty for merge");
    const newGrid = JSON.parse(JSON.stringify(currentGrid));
    const firstTile = newGrid[path[0].r][path[0].c];
    const baseValue = firstTile.value;
    const numTilesInPath = path.length;
    let mergedValue = baseValue * numTilesInPath;
    if (isDoublerActive) {
        mergedValue *= 2;
    }
    const scoreEarned = mergedValue;
    // Clear all tiles in path except the last one
    for (let i = 0; i < path.length - 1; i++) {
        newGrid[path[i].r][path[i].c] = null;
    }
    // Update the last tile in path
    const lastPos = path[path.length - 1];
    newGrid[lastPos.r][lastPos.c] = {
        ...firstTile, // Retains ID of one of the tiles (could be new ID too)
        id: generateId(), // Generate new ID for merged tile to avoid key issues if old ID was used for non-last tile
        r: lastPos.r,
        c: lastPos.c,
        value: mergedValue,
        cooldown: TILE_COOLDOWN_TURNS + 1, // +1 because it will be decremented this turn
        blocked: false,
    };
    return { newGrid, mergedValue, scoreEarned };
};
