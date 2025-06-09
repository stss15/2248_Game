export var PowerUpType;
(function (PowerUpType) {
    PowerUpType["BOMB"] = "BOMB";
    PowerUpType["DOUBLER"] = "DOUBLER";
    PowerUpType["TELEPORT"] = "TELEPORT";
})(PowerUpType || (PowerUpType = {}));
export var GameOverReason;
(function (GameOverReason) {
    GameOverReason["NO_ENERGY"] = "No energy remaining!";
    GameOverReason["NO_VALID_MERGES"] = "No valid merges left!";
    GameOverReason["ENEMY_AT_CENTER"] = "An enemy reached the center!";
    GameOverReason["PLAYER_QUIT"] = "Player quit.";
})(GameOverReason || (GameOverReason = {}));
// For power-up activation states
export var ActivePowerUpMode;
(function (ActivePowerUpMode) {
    ActivePowerUpMode[ActivePowerUpMode["NONE"] = 0] = "NONE";
    ActivePowerUpMode[ActivePowerUpMode["BOMB_TARGETING"] = 1] = "BOMB_TARGETING";
    ActivePowerUpMode[ActivePowerUpMode["TELEPORT_SELECT_1"] = 2] = "TELEPORT_SELECT_1";
    ActivePowerUpMode[ActivePowerUpMode["TELEPORT_SELECT_2"] = 3] = "TELEPORT_SELECT_2";
})(ActivePowerUpMode || (ActivePowerUpMode = {}));
