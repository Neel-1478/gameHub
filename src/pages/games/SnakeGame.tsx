import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { GameProvider, useGameHistory } from '../../context/GameContext';

// Direction type
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const SnakeGame: React.FC = () => {
  // Game dimensions and settings
  const GRID_SIZE = 20;
  const CELL_SIZE = 20;
  const GAME_SPEED = 100;
  
  // Game state
  const [snake, setSnake] = useState<{ x: number, y: number }[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<{ x: number, y: number }>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [playerName, setPlayerName] = useState<string>('Player 1');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>('');
  
  const gameLoopRef = useRef<number | null>(null);
  const lastDirectionRef = useRef<Direction>('RIGHT');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const { addGameResult } = useGameHistory();

  // Initialize high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Generate random food position
  const generateFood = useCallback(() => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    
    // Make sure food doesn't appear on snake
    const isOnSnake = snake.some(segment => segment.x === x && segment.y === y);
    if (isOnSnake) {
      return generateFood();
    }
    
    return { x, y };
  }, [snake, GRID_SIZE]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (isPaused || isGameOver) return;
    
    // Update snake position
    const head = { ...snake[0] };
    lastDirectionRef.current = direction;
    
    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }
    
    // Check for collision with walls
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      handleGameOver();
      return;
    }
    
    // Check for collision with self
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      handleGameOver();
      return;
    }
    
    // Create new snake
    const newSnake = [head, ...snake];
    
    // Check for food collision
    if (head.x === food.x && head.y === food.y) {
      // Increase score
      const newScore = score + 1;
      setScore(newScore);
      
      // Update high score if needed
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('snakeHighScore', newScore.toString());
      }
      
      // Generate new food
      setFood(generateFood());
    } else {
      // Remove tail if no food was eaten
      newSnake.pop();
    }
    
    setSnake(newSnake);
    
    // Draw game
    drawGame(newSnake);
  }, [snake, direction, food, isPaused, isGameOver, score, highScore, generateFood, GRID_SIZE]);

  // Handle game over
  const handleGameOver = () => {
    setIsGameOver(true);
    setIsPaused(true);
    
    // Add to game history if score > 0
    if (score > 0) {
      addGameResult({
        gameName: 'Snake',
        players: [playerName],
        winner: playerName
      });
    }
  };

  // Start/restart game
  const startGame = () => {
    // Reset game state
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection('RIGHT');
    lastDirectionRef.current = 'RIGHT';
    setIsGameOver(false);
    setScore(0);
    setIsPaused(false);
    
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // Toggle pause state
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Draw game on canvas
  const drawGame = (currentSnake: { x: number, y: number }[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    ctx.fillStyle = '#3b82f6';
    currentSnake.forEach((segment, index) => {
      // Head is a different color
      if (index === 0) {
        ctx.fillStyle = '#2563eb';
      } else {
        ctx.fillStyle = '#3b82f6';
      }
      
      ctx.fillRect(
        segment.x * CELL_SIZE, 
        segment.y * CELL_SIZE, 
        CELL_SIZE, 
        CELL_SIZE
      );
      
      // Add a border to make segments more visible
      ctx.strokeStyle = '#f9fafb';
      ctx.strokeRect(
        segment.x * CELL_SIZE, 
        segment.y * CELL_SIZE, 
        CELL_SIZE, 
        CELL_SIZE
      );
    });
    
    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  };

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const currentDirection = lastDirectionRef.current;
    
    switch (e.key) {
      case 'ArrowUp':
        if (currentDirection !== 'DOWN') setDirection('UP');
        break;
      case 'ArrowDown':
        if (currentDirection !== 'UP') setDirection('DOWN');
        break;
      case 'ArrowLeft':
        if (currentDirection !== 'RIGHT') setDirection('LEFT');
        break;
      case 'ArrowRight':
        if (currentDirection !== 'LEFT') setDirection('RIGHT');
        break;
      case ' ':
        // Space bar toggles pause
        togglePause();
        break;
    }
  }, []);

  // Handle direction button clicks
  const handleDirectionClick = (newDirection: Direction) => {
    const currentDirection = lastDirectionRef.current;
    
    // Prevent moving in opposite direction
    if (
      (newDirection === 'UP' && currentDirection !== 'DOWN') ||
      (newDirection === 'DOWN' && currentDirection !== 'UP') ||
      (newDirection === 'LEFT' && currentDirection !== 'RIGHT') ||
      (newDirection === 'RIGHT' && currentDirection !== 'LEFT')
    ) {
      setDirection(newDirection);
    }
  };

  // Edit player name
  const startEditingName = () => {
    setIsEditing(true);
    setEditedName(playerName);
  };

  const savePlayerName = () => {
    if (editedName.trim()) {
      setPlayerName(editedName.trim());
    }
    setIsEditing(false);
  };

  // Setup key event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Game loop timer
  useEffect(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    gameLoopRef.current = window.setInterval(gameLoop, GAME_SPEED);
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameLoop, GAME_SPEED]);
  
  // Initial draw
  useEffect(() => {
    drawGame(snake);
  }, [snake]);

  return (
    <div>
      <PageHeader 
        title="Snake" 
        subtitle="Eat, grow, and don't hit the walls!"
        icon={<div className="w-8 h-8 bg-blue-500 rounded-sm"></div>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card p-6">
            {/* Game status display */}
            {isGameOver ? (
              <motion.div 
                className="text-center mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">
                  <Trophy className="inline-block mr-2 mb-1" />
                  Game Over! Your score: <span className="font-bold">{score}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="text-center mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-lg font-medium mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Score: </span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{score}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  High Score: {highScore}
                </div>
              </motion.div>
            )}

            {/* Canvas */}
            <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700">
              <canvas
                ref={canvasRef}
                width={GRID_SIZE * CELL_SIZE}
                height={GRID_SIZE * CELL_SIZE}
                className="mx-auto"
              />
              
              {/* Overlay for paused state */}
              {isPaused && !isGameOver && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-xl font-bold">PAUSED</div>
                </div>
              )}
              
              {/* Overlay for game over state */}
              {isGameOver && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-xl font-bold">GAME OVER</div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <motion.button
                className="btn btn-primary flex items-center"
                onClick={startGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                {isGameOver ? 'Play Again' : 'New Game'}
              </motion.button>
              
              {!isGameOver && (
                <motion.button
                  className="btn btn-secondary flex items-center"
                  onClick={togglePause}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPaused ? (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="mr-2 h-5 w-5" />
                      Pause
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Player</h2>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Player Name</span>
                <button 
                  onClick={startEditingName}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Edit
                </button>
              </div>
              
              {isEditing ? (
                <div className="flex mt-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-grow px-3 py-2 text-sm rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Enter player name"
                    autoFocus
                  />
                  <button
                    onClick={savePlayerName}
                    className="px-3 py-2 text-sm bg-primary-600 text-white rounded-r-lg hover:bg-primary-700"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-800 dark:text-blue-200">
                  {playerName}
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Controls</h2>
            
            {/* Touch controls for direction */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="col-start-2">
                <button
                  onClick={() => handleDirectionClick('UP')}
                  className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex justify-center"
                  disabled={isPaused}
                >
                  <ArrowUp />
                </button>
              </div>
              <div className="col-start-1">
                <button
                  onClick={() => handleDirectionClick('LEFT')}
                  className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex justify-center"
                  disabled={isPaused}
                >
                  <ArrowLeft />
                </button>
              </div>
              <div className="col-start-3">
                <button
                  onClick={() => handleDirectionClick('RIGHT')}
                  className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex justify-center"
                  disabled={isPaused}
                >
                  <ArrowRight />
                </button>
              </div>
              <div className="col-start-2">
                <button
                  onClick={() => handleDirectionClick('DOWN')}
                  className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex justify-center"
                  disabled={isPaused}
                >
                  <ArrowDown />
                </button>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-medium mb-2">How to Play</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Use arrow keys or the directional buttons to control the snake</li>
                <li>• Eat the red food to grow and increase your score</li>
                <li>• Avoid hitting the walls or your own tail</li>
                <li>• Press space bar or the Pause button to pause the game</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap with GameProvider to ensure game history functionality
const SnakeWithProvider: React.FC = () => (
  <GameProvider>
    <SnakeGame />
  </GameProvider>
);

export default SnakeWithProvider;