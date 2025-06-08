
export const getTileColors = (value: number, cooldown: number, isEnemy?: boolean, isSelected?: boolean, isPathEnd?: boolean): string => {
  let baseColors = '';
  if (isEnemy) {
    baseColors = 'bg-red-700 border-red-900 text-white';
  } else {
    switch (value) {
      case 2:    baseColors = 'bg-slate-200 border-slate-400 text-slate-800'; break;
      case 4:    baseColors = 'bg-slate-300 border-slate-500 text-slate-900'; break;
      case 6:    baseColors = 'bg-cyan-200 border-cyan-400 text-cyan-800'; break; // 2*3
      case 8:    baseColors = 'bg-emerald-300 border-emerald-500 text-emerald-900'; break;
      case 10:   baseColors = 'bg-teal-300 border-teal-500 text-teal-900'; break; // 2*5
      case 12:   baseColors = 'bg-sky-300 border-sky-500 text-sky-900'; break; // 2*6 or 4*3
      case 16:   baseColors = 'bg-amber-400 border-amber-600 text-white'; break;
      case 20:   baseColors = 'bg-lime-400 border-lime-600 text-gray-900'; break; // 4*5
      case 24:   baseColors = 'bg-green-400 border-green-600 text-white'; break; // 4*6 or 8*3
      case 32:   baseColors = 'bg-orange-400 border-orange-600 text-white'; break;
      case 40:   baseColors = 'bg-yellow-400 border-yellow-600 text-gray-900'; break; // 8*5
      case 48:   baseColors = 'bg-red-400 border-red-600 text-white'; break; // 8*6
      case 64:   baseColors = 'bg-rose-500 border-rose-700 text-white'; break;
      case 128:  baseColors = 'bg-fuchsia-500 border-fuchsia-700 text-white'; break;
      case 256:  baseColors = 'bg-purple-600 border-purple-800 text-white'; break;
      case 512:  baseColors = 'bg-violet-600 border-violet-800 text-white'; break;
      case 1024: baseColors = 'bg-indigo-600 border-indigo-800 text-white'; break;
      case 2048: baseColors = 'bg-blue-700 border-blue-900 text-white'; break;
      default:   baseColors = 'bg-gray-700 border-gray-900 text-white'; // For higher or non-standard values
                  if (value > 2048) baseColors = 'bg-black border-gray-700 text-yellow-300 font-press-start';
    }
  }

  let effects = 'transition-all duration-200 ease-out transform hover:scale-105 active:scale-95';
  if (isSelected) {
    effects += ' ring-4 ring-yellow-400 scale-110 z-10';
    if(isPathEnd) effects += ' ring-sky-300';
  }
  if (cooldown > 0) {
    effects += ' opacity-60'; // grayscale filter might be too much, opacity is simpler
  }
  
  return `${baseColors} ${effects} border-2 rounded-lg shadow-md flex items-center justify-center relative`;
};

export const getPowerUpIcon = (type: import('./types').PowerUpType): string => {
  switch (type) {
    case 'BOMB': return '💣';
    case 'DOUBLER': return '2️⃣✖️'; // Or ✨
    case 'TELEPORT': return '🌀'; // Or ↔️
    default: return '❓';
  }
};

export const getPowerUpTooltip = (type: import('./types').PowerUpType): string => {
  switch (type) {
    case 'BOMB': return 'Bomb: Destroys target tile and its adjacent tiles (3x3 area).';
    case 'DOUBLER': return 'Doubler: The next merge result will be doubled.';
    case 'TELEPORT': return 'Teleport: Swap any two tiles on the grid.';
    default: return 'Unknown Power-up';
  }
};

export const PowerUpColors: Record<import('./types').PowerUpType, string> = {
  BOMB: 'bg-red-500 hover:bg-red-600',
  DOUBLER: 'bg-yellow-500 hover:bg-yellow-600',
  TELEPORT: 'bg-blue-500 hover:bg-blue-600',
};
