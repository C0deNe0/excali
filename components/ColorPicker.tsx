import React from 'react';
import { useCanvasStore } from '../store/useCanvasStore';

const COLORS = [
  '#ffffff', // White
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#6366F1', // Indigo (Theme)
  '#a855f7', // Purple
];

const STROKE_WIDTHS = [2, 4, 6, 8];

const ColorPicker: React.FC  = () => {
  const { strokeColor, setStrokeColor, strokeWidth, setStrokeWidth } = useCanvasStore();

  return (
    <div className="fixed top-24 left-4 z-50 bg-[#121212] p-4 rounded-xl shadow-2xl border-2 border-white/10 text-white w-64 transform rotate-1 hover:rotate-0 transition-transform duration-300">
      <div className="absolute -top-4 -right-4 w-8 h-8 bg-pink-500 rounded-full border-2 border-[#121212] flex items-center justify-center shadow-lg">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      </div>
      
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
        Palette
      </h3>
      
      <div className="grid grid-cols-4 gap-2 mb-6">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setStrokeColor(color)} //here we can see the use of the zustand store we are globally maintaing the state of the strokecolor
            className={`w-10 h-10 rounded-xl border-2 transition-all duration-200 hover:scale-110 shadow-sm ${
              strokeColor === color 
                ? 'border-white ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#121212]' 
                : 'border-transparent hover:border-white/30'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>

      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        Thickness
      </h3>
      
      <div className="flex gap-2 items-center bg-[#1E1E2F] p-1.5 rounded-xl border border-white/5">
        {STROKE_WIDTHS.map((width) => (
          <button
            key={width}
            onClick={() => setStrokeWidth(width)}
            className={`flex-1 h-10 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors group ${
              strokeWidth === width ? 'bg-white/10' : ''
            }`}
          >
            <div
              className={`bg-current rounded-full transition-all duration-200 group-hover:scale-110 ${strokeWidth === width ? 'text-white' : 'text-gray-500'}`}
              style={{ 
                width: Math.max(width * 2, 4), 
                height: Math.max(width * 2, 4),
                backgroundColor: strokeWidth === width ? strokeColor : undefined
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;