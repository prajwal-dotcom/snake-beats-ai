import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  coverUrl: string;
}

const TRACKS: Track[] = [
  {
    id: '1',
    title: 'Neon Drift',
    artist: 'AI Synthwave',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80&w=200&h=200',
  },
  {
    id: '2',
    title: 'Cybernetic Pulse',
    artist: 'Neural Beats',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200&h=200',
  },
  {
    id: '3',
    title: 'Digital Horizon',
    artist: 'Algorithm Audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=200&h=200',
  },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleTrackEnd = () => {
    playNext();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setProgress(value);
    if (audioRef.current) {
      audioRef.current.currentTime = (value / 100) * audioRef.current.duration;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-black p-4 border-4 border-cyan-400 relative overflow-hidden box-glitch-reverse">
      <div className="absolute inset-0 scanlines"></div>
      
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
      />

      <div className="flex items-center gap-4 relative z-10">
        {/* Album Art */}
        <div className="relative w-16 h-16 border-2 border-fuchsia-500 shrink-0 group overflow-hidden">
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className={`w-full h-full object-cover ${isPlaying ? 'animate-static' : 'grayscale'}`}
          />
          <div className={`absolute inset-0 bg-fuchsia-500/30 mix-blend-overlay ${isPlaying ? 'opacity-100' : 'opacity-0'}`}></div>
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="flex gap-1 items-end h-4">
                <div className="w-2 bg-cyan-400 animate-[bounce_0.5s_infinite_0ms]"></div>
                <div className="w-2 bg-fuchsia-400 animate-[bounce_0.5s_infinite_100ms]"></div>
                <div className="w-2 bg-cyan-400 animate-[bounce_0.5s_infinite_200ms]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-cyan-400 font-pixel truncate text-sm text-glitch mb-2 uppercase">
            {currentTrack.title}
          </h3>
          <p className="text-fuchsia-500 text-xs truncate font-terminal uppercase tracking-widest">
            {currentTrack.artist}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={playPrev}
            className="p-2 text-fuchsia-500 hover:text-black hover:bg-fuchsia-500 border-2 border-transparent hover:border-fuchsia-500 transition-colors"
          >
            <SkipBack size={20} />
          </button>
          
          <button
            onClick={togglePlay}
            className="p-3 bg-cyan-400 text-black border-2 border-cyan-400 hover:bg-black hover:text-cyan-400 box-glitch transition-colors"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          
          <button
            onClick={playNext}
            className="p-2 text-fuchsia-500 hover:text-black hover:bg-fuchsia-500 border-2 border-transparent hover:border-fuchsia-500 transition-colors"
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 relative z-10 group h-4 bg-black border-2 border-fuchsia-500">
        <div 
          className="h-full bg-cyan-400"
          style={{ width: `${progress}%` }}
        ></div>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      
      {/* Volume Toggle */}
      <div className="absolute top-2 right-2 z-10">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-1 text-cyan-400 hover:text-fuchsia-500 transition-colors"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </div>
  );
}
