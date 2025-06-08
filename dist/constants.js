import { PowerUpType } from './types.js';
export const GRID_ROWS = 8;
export const GRID_COLS = 5;
export const INITIAL_ENERGY = 30; // Increased for more playtime
export const TILE_COOLDOWN_TURNS = 3;
export const POWERUP_AWARD_CHAIN_LENGTH = 5; // Min chain length to get a powerup
export const ENEMY_DESTRUCTION_CHAIN_LENGTH = 6;
// Center for enemy AI targeting
export const ENEMY_TARGET_R = Math.floor((GRID_ROWS - 1) / 2); // For 8 rows -> 3
export const ENEMY_TARGET_C = Math.floor((GRID_COLS - 1) / 2); // For 5 cols -> 2
export const INITIAL_TILE_VALUES = [2, 4, 8];
export const INITIAL_TILE_WEIGHTS = [0.6, 0.3, 0.1]; // Must sum to 1
export const SCORE_PER_TILE_VALUE_MERGED = 1; // Score = merged_value * SCORE_PER_TILE_VALUE_MERGED
export const ENERGY_COST_PER_MERGE = 1;
export const ENERGY_BONUS_PER_5_CHAIN = 1; // Gain 1 energy for every 5 tiles in a chain (len // 5)
export const ENEMY_SPAWN_INTERVAL_TURNS = 7; // Spawn an enemy every N turns
export const MAX_ENEMIES = 3;
export const AVAILABLE_POWERUPS = [
    PowerUpType.BOMB,
    PowerUpType.DOUBLER,
    PowerUpType.TELEPORT,
];
const createMission = (id, description, target, reward) => ({
    id,
    description,
    target,
    progress: 0,
    isCompleted: false,
    reward,
});
export const PREDEFINED_MISSIONS = [
    createMission("m1", "Create two 64 tiles", { value: 64, count: 2 }, { energy: 10, score: 500 }),
    createMission("m2", "Merge a chain of 6 tiles", { chainLength: 6 }, { powerUp: PowerUpType.BOMB, energy: 5 }),
    createMission("m3", "Merge a chain of 4 even-valued tiles", { chainLength: 4, chainValueProperty: 'even' }, { powerUp: PowerUpType.DOUBLER, score: 200 }),
    createMission("m4", "Score 500 points in a single merge", { scoreInMerge: 500 }, { energy: 15 }),
    createMission("m5", "Destroy 2 enemies", { enemiesDestroyed: 2 }, { powerUp: PowerUpType.TELEPORT, score: 300 }),
    createMission("m6", "Achieve a 256 tile", { value: 256, count: 1 }, { energy: 20, score: 1000 }),
    createMission("m7", "Merge a chain of 7 tiles", { chainLength: 7 }, { powerUp: PowerUpType.BOMB, energy: 10 }),
    createMission("m8", "Create three 32 tiles", { value: 32, count: 3 }, { energy: 5, score: 300 }),
];
