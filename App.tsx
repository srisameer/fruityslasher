
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, Difficulty } from './types';
import GameCanvas from './components/GameCanvas';
import Controls from './components/Controls';
import Overlay from './components/Overlay';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isInfiniteLife, setIsInfiniteLife] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem('fruity_high_score')) || 0;
  });

  const keysPressed = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: any) => keysPressed.current.add(e.code);
    const handleKeyUp = (e: any) => keysPressed.current.delete(e.code);
    (window as any).addEventListener('keydown', handleKeyDown);
    (window as any).addEventListener('keyup', handleKeyUp);
    return () => {
      (window as any).removeEventListener('keydown', handleKeyDown);
      (window as any).removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleStartGame = (diff: Difficulty, infinite: boolean) => {
    setDifficulty(diff);
    setScore(0);
    setLives(3);
    setIsInfiniteLife(infinite);
    setStatus(GameStatus.PLAYING);
  };

  const handlePause = () => {
    if (status === GameStatus.PLAYING) setStatus(GameStatus.PAUSED);
    else if (status === GameStatus.PAUSED) setStatus(GameStatus.PLAYING);
  };

  const handleGameOver = useCallback((finalScore: number) => {
    setStatus(GameStatus.GAMEOVER);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('fruity_high_score', finalScore.toString());
    }
  }, [highScore]);

  const handleExit = () => {
    setStatus(GameStatus.IDLE);
  };

  const handleLifeLost = () => {
    if (!isInfiniteLife) {
      setLives(prev => prev - 1);
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 flex items-center justify-center overflow-hidden font-sans">
      <div className="relative w-full max-w-[1280px] aspect-video bg-black shadow-2xl overflow-hidden rounded-lg border-4 border-slate-800">
        <GameCanvas 
          status={status}
          difficulty={difficulty}
          onScoreUpdate={(s) => setScore(prev => prev + s)}
          onLifeLost={handleLifeLost}
          onGameOver={handleGameOver}
          lives={lives}
          isInfiniteLife={isInfiniteLife}
          keysPressed={keysPressed.current}
        />

        {/* HUD */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-10">
          <div className="bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="text-xs text-orange-400 font-bold uppercase tracking-widest">Score</div>
            <div className="text-4xl text-white font-black">{score}</div>
          </div>

          <div className="flex gap-2">
            {isInfiniteLife ? (
              <div className="flex items-center gap-2 bg-rose-500/20 px-4 py-2 rounded-full border border-rose-500/50 backdrop-blur-md">
                <i className="fa-solid fa-infinity text-rose-500 text-2xl animate-pulse"></i>
                <span className="text-white font-bold text-sm tracking-widest uppercase">GOD MODE</span>
              </div>
            ) : (
              Array.from({ length: 3 }).map((_, i) => (
                <i 
                  key={i} 
                  className={`fa-solid fa-heart text-3xl transition-all duration-300 ${i < lives ? 'text-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'text-slate-600 grayscale opacity-30'}`}
                />
              ))
            )}
          </div>

          <div className="bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/10 shadow-lg text-right">
            <div className="text-xs text-yellow-400 font-bold uppercase tracking-widest">High Score</div>
            <div className="text-2xl text-white font-bold">{highScore}</div>
          </div>
        </div>

        <Overlay 
          status={status} 
          score={score} 
          highScore={highScore}
          onStart={handleStartGame}
          onResume={handlePause}
          onExit={handleExit}
        />

        {status === GameStatus.PLAYING && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-12 z-20 opacity-40 hover:opacity-100 transition-opacity">
            <Controls 
              onSlice={() => {
                const event = new (window as any).KeyboardEvent('keydown', { code: 'Space' });
                (window as any).dispatchEvent(event);
              }}
              onDirection={(dir, active) => {
                const code = dir === 'up' ? 'ArrowUp' : dir === 'down' ? 'ArrowDown' : dir === 'left' ? 'ArrowLeft' : 'ArrowRight';
                if (active) keysPressed.current.add(code);
                else keysPressed.current.delete(code);
              }}
            />
          </div>
        )}

        {status === GameStatus.PLAYING && (
          <button 
            onClick={handlePause}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all z-20 group"
          >
            <i className="fa-solid fa-pause text-white text-xl group-hover:scale-110"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default App;
