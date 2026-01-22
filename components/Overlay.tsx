
import React, { useState } from 'react';
import { GameStatus, Difficulty } from '../types';

interface OverlayProps {
  status: GameStatus;
  score: number;
  highScore: number;
  onStart: (diff: Difficulty, infinite: boolean) => void;
  onResume: () => void;
  onExit: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ status, score, highScore, onStart, onResume, onExit }) => {
  const [infiniteMode, setInfiniteMode] = useState(false);

  if (status === GameStatus.PLAYING) return null;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-8">
      <div className="max-w-md w-full bg-slate-800 rounded-3xl border-4 border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
        {status === GameStatus.IDLE && (
          <div className="p-8 text-center">
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter italic">FRUITY<br/><span className="text-orange-500">SLASHER</span></h1>
            <p className="text-slate-400 mb-6 font-medium">Test your reflexes. Slice fruits, avoid bombs!</p>
            
            <div className="flex items-center justify-center gap-3 mb-8 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
              <span className={`text-xs font-bold transition-colors ${!infiniteMode ? 'text-white' : 'text-slate-500'}`}>CLASSIC</span>
              <button 
                onClick={() => setInfiniteMode(!infiniteMode)}
                className={`w-14 h-7 rounded-full relative transition-colors ${infiniteMode ? 'bg-rose-500' : 'bg-slate-600'}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${infiniteMode ? 'left-8' : 'left-1'}`} />
              </button>
              <span className={`text-xs font-bold transition-colors ${infiniteMode ? 'text-rose-500' : 'text-slate-500'}`}>INFINITE LIVES</span>
            </div>

            <div className="grid gap-3 mb-8">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Select Difficulty</p>
              <button onClick={() => onStart(Difficulty.EASY, infiniteMode)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg hover:-translate-y-1">EASY</button>
              <button onClick={() => onStart(Difficulty.MEDIUM, infiniteMode)} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg hover:-translate-y-1">MEDIUM</button>
              <button onClick={() => onStart(Difficulty.HARD, infiniteMode)} className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl transition-all shadow-lg hover:-translate-y-1">HARD</button>
            </div>

            <div className="text-slate-500 text-sm italic">
              Use Arrow Keys + Space to play or touch buttons
            </div>
          </div>
        )}

        {status === GameStatus.PAUSED && (
          <div className="p-8 text-center">
            <h2 className="text-4xl font-black text-white mb-8 tracking-tighter">GAME PAUSED</h2>
            <div className="grid gap-4">
              <button onClick={onResume} className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-2xl shadow-xl transition-all">RESUME</button>
              <button onClick={onExit} className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition-all">MAIN MENU</button>
            </div>
          </div>
        )}

        {status === GameStatus.GAMEOVER && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-rose-500 animate-pulse">
              <i className="fa-solid fa-skull text-4xl"></i>
            </div>
            <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">GAME OVER</h2>
            <div className="bg-slate-900/50 rounded-2xl p-6 mb-8 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Final Score</span>
                <span className="text-3xl text-white font-black">{score}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Best</span>
                <span className="text-xl text-yellow-500 font-bold">{highScore}</span>
              </div>
            </div>
            <div className="grid gap-4">
              <button onClick={() => onStart(Difficulty.MEDIUM, false)} className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-2xl shadow-xl transition-all">PLAY AGAIN</button>
              <button onClick={onExit} className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition-all">MAIN MENU</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Overlay;
