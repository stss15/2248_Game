import React from 'react';
import { ActivePowerUpMode } from '../types.js';
import { getPowerUpIcon, getPowerUpTooltip, PowerUpColors } from '../utils/theme.js';
const StatItem = ({ label, value, className }) => (React.createElement("div", { className: `p-2 sm:p-3 bg-slate-700 rounded-lg shadow text-center ${className}` },
    React.createElement("div", { className: "text-xs sm:text-sm text-sky-300 uppercase tracking-wider" }, label),
    React.createElement("div", { className: "text-xl sm:text-2xl font-bold text-white" }, value)));
const HudDisplay = ({ score, energy, turn, mission, availablePowerUps, gameStats, isDoublerActive, activePowerUpMode, onActivatePowerUp, onCancelPowerUp }) => {
    const isTargetingPowerUp = activePowerUpMode === ActivePowerUpMode.BOMB_TARGETING ||
        activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_1 ||
        activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_2 ||
        activePowerUpMode === ActivePowerUpMode.SHOVE_SELECT_1 ||
        activePowerUpMode === ActivePowerUpMode.SHOVE_SELECT_2;
    return (React.createElement("div", { className: "w-full md:w-96 p-3 sm:p-4 space-y-4 bg-slate-800 rounded-lg shadow-2xl text-slate-100 hud-glass fade-in" },
        React.createElement("div", { className: "grid grid-cols-3 gap-2" },
            React.createElement(StatItem, { label: "Score", value: score }),
            React.createElement(StatItem, { label: "Energy", value: energy, className: energy <= 5 ? 'text-red-400' : energy <= 10 ? 'text-yellow-400' : 'text-green-400' }),
            React.createElement(StatItem, { label: "Turn", value: turn })),
        isDoublerActive && (React.createElement("div", { className: "p-2 text-center bg-yellow-500 text-black rounded-md font-semibold animate-pulse" }, "2x Doubler ACTIVE for next merge!")),
        isTargetingPowerUp && (React.createElement("div", { className: "p-3 bg-blue-600 rounded-lg text-center" },
            React.createElement("p", { className: "font-semibold text-white" },
                activePowerUpMode === ActivePowerUpMode.BOMB_TARGETING && "Select Bomb Target",
                activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_1 && "Select First Tile to Teleport",
                activePowerUpMode === ActivePowerUpMode.TELEPORT_SELECT_2 && "Select Second Tile to Teleport",
                activePowerUpMode === ActivePowerUpMode.SHOVE_SELECT_1 && "Select Enemy to Shove",
                activePowerUpMode === ActivePowerUpMode.SHOVE_SELECT_2 && "Select Adjacent Target Tile"),
            React.createElement("button", { onClick: onCancelPowerUp, className: "mt-2 px-3 py-1 bg-red-500 hover:bg-red-700 text-white text-xs rounded shadow" }, "Cancel Power-Up"))),
        React.createElement("div", { className: "space-y-3" },
            React.createElement("h3", { className: "text-lg font-semibold text-sky-200 border-b border-slate-700 pb-1" }, "Mission"),
            React.createElement("div", { className: "p-3 bg-slate-700 rounded-lg shadow" },
                React.createElement("p", { className: "text-sm text-slate-300" }, mission.description),
                React.createElement("div", { className: "w-full bg-slate-600 rounded-full h-2.5 mt-2" },
                    React.createElement("div", { className: `h-2.5 rounded-full ${mission.isCompleted ? 'bg-green-500' : 'bg-sky-500'}`, style: { width: `${mission.isCompleted ? 100 : Math.min(100, (mission.progress / (mission.target.count || mission.target.chainLength || mission.target.scoreInMerge || mission.target.enemiesDestroyed || mission.target.enemiesStunned || 1)) * 100)}%` } })),
                mission.isCompleted && React.createElement("p", { className: "text-xs text-green-400 mt-1" },
                    "Completed! Reward: ",
                    JSON.stringify(mission.reward)))),
        React.createElement("div", { className: "space-y-2" },
            React.createElement("h3", { className: "text-lg font-semibold text-sky-200 border-b border-slate-700 pb-1" }, "Power-Ups"),
            availablePowerUps.length > 0 ? (React.createElement("div", { className: "flex flex-wrap gap-2" }, availablePowerUps.map(pu => (React.createElement("button", { key: pu.id, onClick: () => onActivatePowerUp(pu.id), disabled: isTargetingPowerUp || isDoublerActive && pu.type === 'DOUBLER', title: getPowerUpTooltip(pu.type), className: `p-3 rounded-lg text-white font-semibold text-lg shadow-md hover:scale-105 transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${PowerUpColors[pu.type]}` }, getPowerUpIcon(pu.type)))))) : (React.createElement("p", { className: "text-sm text-slate-400 italic" }, "No power-ups available. Make longer chains!"))),
        React.createElement("div", { className: "space-y-2 pt-2 border-t border-slate-700" },
            React.createElement("h3", { className: "text-lg font-semibold text-sky-200" }, "Game Stats"),
            React.createElement("div", { className: "text-xs grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300" },
                React.createElement("p", null,
                    "Merges: ",
                    React.createElement("span", { className: "font-semibold text-white" }, gameStats.mergesMade)),
                React.createElement("p", null,
                    "Max Chain: ",
                    React.createElement("span", { className: "font-semibold text-white" }, gameStats.maxChainLength)),
                React.createElement("p", null,
                    "Highest Tile: ",
                    React.createElement("span", { className: "font-semibold text-white" }, gameStats.highestTileValue)),
                React.createElement("p", null,
                    "Enemies Defeated: ",
                    React.createElement("span", { className: "font-semibold text-white" }, gameStats.enemiesDefeated)),
                React.createElement("p", null,
                    "Powerups Used: ",
                    React.createElement("span", { className: "font-semibold text-white" }, gameStats.powerUpsUsed))))));
};
export default HudDisplay;
