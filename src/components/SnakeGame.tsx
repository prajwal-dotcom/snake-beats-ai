import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // Ensure food doesn't spawn on the snake
    const isOnSnake = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
    if (!isOnSnake) break;
  }
  return newFood;
};

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
}

export default function SnakeGame({ onScoreChange }: SnakeGameProps) {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  
  const directionRef = useRef<Direction>('RIGHT');
  const snakeRef = useRef<Point[]>(snake);
  const foodRef = useRef<Point>(food);
  const scoreRef = useRef<number>(score);
  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const resetGame = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    const initialFood = generateFood(initialSnake);
    setSnake(initialSnake);
    setFood(initialFood);
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    onScoreChange(0);
  };

  const changeDirection = useCallback((newDir: Direction) => {
    if (gameOver || isPaused) return;
    
    if (newDir === 'UP' && directionRef.current !== 'DOWN') setDirection('UP');
    if (newDir === 'DOWN' && directionRef.current !== 'UP') setDirection('DOWN');
    if (newDir === 'LEFT' && directionRef.current !== 'RIGHT') setDirection('LEFT');
    if (newDir === 'RIGHT' && directionRef.current !== 'LEFT') setDirection('RIGHT');
  }, [gameOver, isPaused]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      
      if (gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          changeDirection('RIGHT');
          break;
        case ' ':
        case 'p':
        case 'P':
          setIsPaused((prev) => !prev);
          break;
      }
    },
    [gameOver, changeDirection]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartRef.current.x;
    const deltaY = touchEndY - touchStartRef.current.y;

    if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        changeDirection('RIGHT');
      } else {
        changeDirection('LEFT');
      }
    } else {
      if (deltaY > 0) {
        changeDirection('DOWN');
      } else {
        changeDirection('UP');
      }
    }

    touchStartRef.current = null;
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    const currentSnake = snakeRef.current;
    const currentFood = foodRef.current;

    const head = currentSnake[0];
    const newHead = { ...head };

    switch (directionRef.current) {
      case 'UP':
        newHead.y -= 1;
        break;
      case 'DOWN':
        newHead.y += 1;
        break;
      case 'LEFT':
        newHead.x -= 1;
        break;
      case 'RIGHT':
        newHead.x += 1;
        break;
    }

    // Check collision with walls
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= GRID_SIZE
    ) {
      setGameOver(true);
      return;
    }

    // Check collision with self
    if (currentSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
      setGameOver(true);
      return;
    }

    const newSnake = [newHead, ...currentSnake];

    // Check if food eaten
    if (newHead.x === currentFood.x && newHead.y === currentFood.y) {
      const newScore = scoreRef.current + 10;
      setScore(newScore);
      onScoreChange(newScore);
      setFood(generateFood(newSnake));
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [gameOver, isPaused, onScoreChange]);

  const currentSpeed = Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 10);

  useEffect(() => {
    gameLoopRef.current = window.setInterval(moveSnake, currentSpeed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake, currentSpeed]);

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        className="relative flex flex-col items-center justify-center w-full max-w-md mx-auto aspect-square bg-black border-4 border-fuchsia-500 overflow-hidden box-glitch touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Play Area */}
        <div className="relative w-full h-full bg-black">
          {/* Grid lines */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{ 
              backgroundImage: 'linear-gradient(#00FFFF 1px, transparent 1px), linear-gradient(90deg, #00FFFF 1px, transparent 1px)',
              backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`
            }}
          />

          {/* Food */}
          <div
            className="absolute bg-fuchsia-500 z-0 animate-pulse"
            style={{
              left: `${(food.x / GRID_SIZE) * 100}%`,
              top: `${(food.y / GRID_SIZE) * 100}%`,
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              boxShadow: '0 0 10px #FF00FF'
            }}
          />

          {/* Snake */}
          {snake.map((segment, index) => {
            const isHead = index === 0;
            return (
              <div
                key={index}
                className={`absolute ${isHead ? 'bg-cyan-400 z-10' : 'bg-cyan-600 z-0'}`}
                style={{
                  left: `${(segment.x / GRID_SIZE) * 100}%`,
                  top: `${(segment.y / GRID_SIZE) * 100}%`,
                  width: `${100 / GRID_SIZE}%`,
                  height: `${100 / GRID_SIZE}%`,
                  boxShadow: isHead ? '0 0 10px #00FFFF' : 'none',
                  border: '1px solid #000'
                }}
              />
            );
          })}
        </div>

        {/* Overlays */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
            <div className="absolute inset-0 scanlines"></div>
            <h2 className="text-4xl font-pixel text-fuchsia-500 mb-4 text-glitch tracking-widest uppercase">GAME OVER</h2>
            <p className="text-cyan-400 mb-8 font-terminal text-2xl">FINAL SCORE: {score}</p>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-black border-2 border-cyan-400 text-cyan-400 font-pixel text-sm hover:bg-cyan-400 hover:text-black transition-colors uppercase tracking-wider box-glitch-reverse relative z-30"
            >
              PLAY AGAIN
            </button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
            <div className="absolute inset-0 scanlines"></div>
            <h2 className="text-3xl font-pixel text-cyan-400 text-glitch tracking-widest uppercase">PAUSED</h2>
            <p className="text-fuchsia-500 mt-4 font-terminal text-xl animate-pulse">PRESS SPACE TO RESUME</p>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="mt-8 md:hidden grid grid-cols-3 gap-2 w-48 mx-auto">
        <div />
        <button 
          onClick={() => changeDirection('UP')}
          className="bg-black border-2 border-cyan-400 text-cyan-400 h-12 flex items-center justify-center active:bg-cyan-400 active:text-black box-glitch transition-colors"
        >
          ▲
        </button>
        <div />
        <button 
          onClick={() => changeDirection('LEFT')}
          className="bg-black border-2 border-fuchsia-500 text-fuchsia-500 h-12 flex items-center justify-center active:bg-fuchsia-500 active:text-black box-glitch-reverse transition-colors"
        >
          ◄
        </button>
        <button 
          onClick={() => changeDirection('DOWN')}
          className="bg-black border-2 border-cyan-400 text-cyan-400 h-12 flex items-center justify-center active:bg-cyan-400 active:text-black box-glitch transition-colors"
        >
          ▼
        </button>
        <button 
          onClick={() => changeDirection('RIGHT')}
          className="bg-black border-2 border-fuchsia-500 text-fuchsia-500 h-12 flex items-center justify-center active:bg-fuchsia-500 active:text-black box-glitch-reverse transition-colors"
        >
          ►
        </button>
      </div>
    </div>
  );
}
