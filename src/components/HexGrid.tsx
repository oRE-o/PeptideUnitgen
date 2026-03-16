import type { Vector2Int } from '../types';

interface HexGridProps {
  radius?: number; // How many rings of hexes to show around center (default 3)
  pattern: Vector2Int[];
  onChange?: (newPattern: Vector2Int[]) => void;
  readOnly?: boolean;
}

// Flat-topped hex math with gaps
const CELL_SIZE = 18; // Mathematical center-to-center distance base
const HEX_RADIUS = 15; // Actual drawn radius (CELL_SIZE - gap)
const HEX_WIDTH = Math.sqrt(3) * CELL_SIZE;
const HEX_HEIGHT = 2 * CELL_SIZE;

export default function HexGrid({ radius = 3, pattern, onChange, readOnly = false }: HexGridProps) {
  // Generate all coordinates in an axial hex grid within `radius`
  const hexes: Vector2Int[] = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
      hexes.push({ x: q, y: r });
    }
  }

  const toggleHex = (q: number, r: number) => {
    if (readOnly || !onChange) return;
    if (q === 0 && r === 0) return; // Can't toggle center center

    const exists = pattern.find(p => p.x === q && p.y === r);
    if (exists) {
      onChange(pattern.filter(p => !(p.x === q && p.y === r)));
    } else {
      onChange([...pattern, { x: q, y: r }]);
    }
  };

  const getHexPixelCenter = (q: number, r: number) => {
    // Pure mathematical grid centers
    const x = CELL_SIZE * Math.sqrt(3) * (q + r / 2);
    const y = CELL_SIZE * (3 / 2) * r;
    return { x, y };
  };

  // SVG viewBox calculation
  const padding = 24;
  const gridWidth = (radius * 2 + 1) * HEX_WIDTH + padding * 2;
  const gridHeight = (radius * 2 + 1) * HEX_HEIGHT * 0.75 + padding * 2;
  const minX = -gridWidth / 2;
  const minY = -gridHeight / 2;

  // Draw flat-topped hexagon path at HEX_RADIUS
  const hexPoints = [0, 1, 2, 3, 4, 5].map(i => {
    const angle_deg = 60 * i - 30; // -30 for flat topped
    const angle_rad = Math.PI / 180 * angle_deg;
    return `${HEX_RADIUS * Math.cos(angle_rad)},${HEX_RADIUS * Math.sin(angle_rad)}`;
  }).join(' ');

  return (
    <div className={`w-full flex items-center justify-center ${readOnly ? '' : 'bg-slate-50 dark:bg-slate-900 rounded-3xl overflow-hidden relative border border-slate-200 dark:border-slate-700'} aspect-[4/5] max-w-sm mx-auto`}>
      <svg 
        viewBox={`${minX} ${minY} ${gridWidth} ${gridHeight}`}
        className="w-full h-full"
      >
        {hexes.map(({ x: q, y: r }) => {
          const { x, y } = getHexPixelCenter(q, r);
          const isCenter = q === 0 && r === 0;
          const isSelected = pattern.some(p => p.x === q && p.y === r);

          return (
            <g 
              key={`${q},${r}`} 
              transform={`translate(${x}, ${y})`}
              onClick={() => toggleHex(q, r)}
              className={readOnly ? '' : (isCenter ? 'cursor-not-allowed' : 'cursor-pointer')}
            >
              <polygon
                points={hexPoints}
                strokeLinejoin="round"
                className={`transition-all duration-200 stroke-[3px]
                  ${isCenter 
                    ? 'fill-blue-500 stroke-blue-500' // Using blue for center to match Blue Archive better, or keep purple if preferred.
                    : isSelected 
                      ? 'fill-yellow-400 stroke-yellow-400 hover:fill-yellow-300 hover:stroke-yellow-300' 
                      : 'fill-white dark:fill-transparent stroke-slate-300 dark:stroke-slate-700/80 hover:stroke-slate-400 dark:hover:stroke-slate-500'
                  }
                `}
              />
              {isCenter && (
                <circle 
                  cx="0" 
                  cy="-10" 
                  r="2.5" 
                  className="fill-red-400 drop-shadow-sm pointer-events-none" 
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
