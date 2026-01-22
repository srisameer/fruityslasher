
import React from 'react';

interface ControlsProps {
  onSlice: () => void;
  onDirection: (dir: 'up' | 'down' | 'left' | 'right', active: boolean) => void;
}

const Controls: React.FC<ControlsProps> = ({ onSlice, onDirection }) => {
  return (
    <div className="flex items-center gap-16 select-none">
      {/* D-PAD */}
      <div className="grid grid-cols-3 grid-rows-3 gap-2 w-48 h-48">
        <div />
        <ControlButton 
          icon="fa-chevron-up" 
          onStart={() => onDirection('up', true)} 
          onEnd={() => onDirection('up', false)} 
        />
        <div />

        <ControlButton 
          icon="fa-chevron-left" 
          onStart={() => onDirection('left', true)} 
          onEnd={() => onDirection('left', false)} 
        />
        <div />
        <ControlButton 
          icon="fa-chevron-right" 
          onStart={() => onDirection('right', true)} 
          onEnd={() => onDirection('right', false)} 
        />

        <div />
        <ControlButton 
          icon="fa-chevron-down" 
          onStart={() => onDirection('down', true)} 
          onEnd={() => onDirection('down', false)} 
        />
        <div />
      </div>

      {/* Slice Action */}
      <div className="flex flex-col items-center gap-2">
        <button 
          onMouseDown={onSlice}
          onTouchStart={(e) => { e.preventDefault(); onSlice(); }}
          className="w-32 h-32 bg-orange-500 active:bg-orange-600 rounded-full flex items-center justify-center shadow-[0_8px_0_rgb(154,52,18)] active:translate-y-2 active:shadow-none transition-all border-4 border-orange-300 group"
        >
          <i className="fa-solid fa-bolt text-5xl text-white drop-shadow-md group-hover:scale-125 transition-transform"></i>
        </button>
        <span className="text-white font-black text-xl uppercase tracking-tighter opacity-80 drop-shadow-lg">SLICE</span>
      </div>
    </div>
  );
};

const ControlButton: React.FC<{ icon: string; onStart: () => void; onEnd: () => void }> = ({ icon, onStart, onEnd }) => {
  return (
    <button 
      onMouseDown={onStart}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchStart={(e) => { e.preventDefault(); onStart(); }}
      onTouchEnd={(e) => { e.preventDefault(); onEnd(); }}
      className="w-full h-full bg-slate-700/60 active:bg-blue-500 rounded-2xl flex items-center justify-center backdrop-blur-md border-2 border-slate-500 shadow-lg active:scale-95 transition-all text-white"
    >
      <i className={`fa-solid ${icon} text-2xl`}></i>
    </button>
  );
};

export default Controls;
