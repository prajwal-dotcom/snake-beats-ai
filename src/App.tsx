import React, { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { Gamepad2, Trophy } from 'lucide-react';

export default function App() {
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-black text-white font-terminal selection:bg-fuchsia-500/50 overflow-hidden relative flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 scanlines"></div>
        <div className="absolute inset-0 static-noise animate-static"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full p-6 flex items-center justify-between border-b-4 border-fuchsia-500 bg-black">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-black border-2 border-cyan-400 box-glitch animate-tear">
            <Gamepad2 className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl md:text-4xl font-pixel tracking-tighter uppercase text-glitch flex flex-col md:flex-row gap-2">
            <span className="text-cyan-400">NEON</span>
            <span className="text-fuchsia-500">BEATS</span>
          </h1>
        </div>

        {/* Score Display */}
        <div className="flex items-center gap-4 px-6 py-3 bg-black border-2 border-cyan-400 box-glitch-reverse">
          <Trophy className="w-8 h-8 text-fuchsia-500 animate-pulse" />
          <div className="flex flex-col items-start">
            <span className="text-sm uppercase tracking-[0.2em] text-cyan-400 font-pixel leading-none mb-2">SCORE</span>
            <span className="text-3xl md:text-4xl font-pixel text-fuchsia-500 leading-none text-glitch">
              {score.toString().padStart(4, '0')}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-8 gap-8">
        
        {/* Game Container */}
        <div className="w-full max-w-2xl flex-1 flex items-center justify-center">
          <div className="w-full max-w-[500px] relative">
            {/* Decorative corners */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-4 border-l-4 border-cyan-400"></div>
            <div className="absolute -top-4 -right-4 w-8 h-8 border-t-4 border-r-4 border-fuchsia-500"></div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-4 border-l-4 border-fuchsia-500"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-4 border-r-4 border-cyan-400"></div>
            
            <SnakeGame onScoreChange={setScore} />
          </div>
        </div>

        {/* Music Player Container */}
        <div className="w-full mt-auto pb-4">
          <MusicPlayer />
        </div>

      </main>
    </div>
  );
}
