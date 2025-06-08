import React from 'react';
const GameOverModal = ({ reason, score, gameStats, onRestart }) => {
    if (!reason)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" },
        React.createElement("div", { className: "bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl text-center w-full max-w-md transform transition-all scale-100 opacity-100" },
            React.createElement("h2", { className: "text-3xl font-bold text-red-500 mb-3 font-press-start" }, "Game Over!"),
            React.createElement("p", { className: "text-slate-300 text-lg mb-6" }, reason),
            React.createElement("div", { className: "mb-6 p-4 bg-slate-700 rounded-lg" },
                React.createElement("p", { className: "text-xl text-sky-300" },
                    "Final Score: ",
                    React.createElement("span", { className: "font-bold text-white text-2xl" }, score))),
            React.createElement("div", { className: "text-left text-sm text-slate-400 mb-6 space-y-1 p-3 bg-slate-750 rounded" },
                React.createElement("h4", { className: "font-semibold text-slate-200 mb-2" }, "Summary:"),
                React.createElement("p", null,
                    "Merges Made: ",
                    React.createElement("span", { className: "font-bold text-white" }, gameStats.mergesMade)),
                React.createElement("p", null,
                    "Highest Tile Value: ",
                    React.createElement("span", { className: "font-bold text-white" }, gameStats.highestTileValue)),
                React.createElement("p", null,
                    "Longest Chain: ",
                    React.createElement("span", { className: "font-bold text-white" }, gameStats.maxChainLength)),
                React.createElement("p", null,
                    "Enemies Defeated: ",
                    React.createElement("span", { className: "font-bold text-white" }, gameStats.enemiesDefeated)),
                React.createElement("p", null,
                    "Power-ups Used: ",
                    React.createElement("span", { className: "font-bold text-white" }, gameStats.powerUpsUsed))),
            React.createElement("button", { onClick: onRestart, className: "w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md text-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75" }, "Restart Game"))));
};
export default GameOverModal;
