import React, { useMemo } from 'react';
import { Seat } from '../types';

interface SeatMapProps {
  selectedSeats: string[];
  onToggleSeat: (seatId: string) => void;
}

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const SeatMap: React.FC<SeatMapProps> = ({ selectedSeats, onToggleSeat }) => {
  // Memoize occupied seats so they stay stable during the component's lifecycle
  const occupiedSeats = useMemo(() => {
    const occupied = new Set<string>();
    ROWS.forEach((row) => {
      COLS.forEach((col) => {
        // Randomly mark ~15% of seats as occupied, but only once
        if (Math.random() < 0.15) {
          occupied.add(`${row}${col}`);
        }
      });
    });
    return occupied;
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
      {/* Screen */}
      <div className="w-full h-2 bg-gradient-to-b from-blue-500 to-transparent rounded-full shadow-[0_-8px_20px_rgba(59,130,246,0.5)] mb-12">
        <p className="text-center text-[10px] uppercase tracking-[0.4em] text-zinc-500 mt-4">Screen</p>
      </div>

      <div className="grid gap-3">
        {ROWS.map((row) => (
          <div key={row} className="flex gap-3 items-center">
            <span className="w-4 text-xs font-bold text-zinc-600 mr-2">{row}</span>
            <div className="flex gap-2">
              {COLS.map((col) => {
                const seatId = `${row}${col}`;
                const isSelected = selectedSeats.includes(seatId);
                const isOccupied = occupiedSeats.has(seatId);

                return (
                  <button
                    key={seatId}
                    disabled={isOccupied}
                    onClick={() => onToggleSeat(seatId)}
                    className={`
                      w-6 h-6 rounded-t-lg transition-all duration-200
                      ${isOccupied ? 'bg-zinc-800 cursor-not-allowed opacity-40' : 
                        isSelected ? 'bg-blue-500 scale-110 shadow-lg shadow-blue-500/50' : 
                        'bg-zinc-700 hover:bg-zinc-600 hover:scale-105'}
                    `}
                    title={seatId}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-6 mt-4 text-xs font-medium text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-zinc-700 rounded-sm"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-zinc-800 rounded-sm"></div>
          <span>Occupied</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;