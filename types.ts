
export interface Position {
  r: number;
  c: number;
}

export interface Tile extends Position {
  id: string;
  value: number;
  cooldown: number; // turns until it can merge again
  blocked: boolean; // for future obstacles
}

export enum PowerUpType {
  BOMB = 'BOMB',
  DOUBLER = 'DOUBLER',
  TELEPORT = 'TELEPORT',
  SHOVE = 'SHOVE',
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
}

export interface Enemy extends Position {
  id: string;
  stunnedForTurns?: number;
}

export interface MissionTarget {
  value?: number; // e.g., make a tile of this value
  count?: number; // e.g., N_COUNT tiles of value N_VALUE
  chainLength?: number; // e.g., merge chain of N_LENGTH
  chainValueProperty?: 'even' | 'odd'; // e.g., chain of even/odd valued tiles
  scoreInMerge?: number; // e.g. achieve X score in a single merge
  enemiesDestroyed?: number; // e.g. destroy X enemies
  enemiesStunned?: number; // e.g. stun X enemies
}

export interface Mission {
  id: string;
  description: string;
  target: MissionTarget;
  progress: number; // Current progress towards target count/length etc.
  isCompleted: boolean;
  reward: {
    energy?: number;
    powerUp?: PowerUpType;
    score?: number;
  };
}

export type Grid = (Tile | null)[][];

export enum GameOverReason {
  NO_ENERGY = "No energy remaining!",
  NO_VALID_MERGES = "No valid merges left!",
  ENEMY_AT_CENTER = "An enemy reached the center!",
  PLAYER_QUIT = "Player quit.", // Placeholder for future use
}

export interface GameStats {
  mergesMade: number;
  tilesSpawned: number;
  powerUpsUsed: number;
  enemiesDefeated: number;
  maxChainLength: number;
  highestTileValue: number;
}

// For power-up activation states
export enum ActivePowerUpMode {
  NONE,
  BOMB_TARGETING,
  TELEPORT_SELECT_1,
  TELEPORT_SELECT_2,
  SHOVE_SELECT_1,
  SHOVE_SELECT_2
}
