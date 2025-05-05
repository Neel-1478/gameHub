import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dice5, RotateCcw, Trophy } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { GameProvider, useGameHistory } from '../../context/GameContext';

// Define player colors
type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

// Define player
interface Player {
  color: PlayerColor;
  name: string;
  pawns: number[];
  isActive: boolean;
  startPosition: number;
  endPosition: number;
  homeStretch: number[];
}

// Board constants
const BOARD_SIZE = 52; // Main track size
const HOME_POSITION = -1;
const FINISHED_POSITION = 100;

// Define the main track coordinates (simplified for visualization)
const TRACK_POSITIONS = [
  // Bottom row (red start)
  { x: 6, y: 14 }, { x: 7, y: 14 }, { x: 8, y: 14 }, { x: 9, y: 14 }, { x: 10, y: 14 }, { x: 11, y: 14 },
  // Bottom right
  { x: 11, y: 13 }, { x: 11, y: 12 }, { x: 11, y: 11 }, { x: 11, y: 10 }, { x: 11, y: 9 }, { x: 11, y: 8 },
  // Right row (green start)
  { x: 12, y: 8 }, { x: 13, y: 8 }, { x: 14, y: 8 }, { x: 15, y: 8 }, { x: 16, y: 8 }, { x: 17, y: 8 },
  // Top right
  { x: 17, y: 7 }, { x: 17, y: 6 }, { x: 17, y: 5 }, { x: 17, y: 4 }, { x: 17, y: 3 }, { x: 17, y: 2 },
  // Top row (yellow start)
  { x: 16, y: 2 }, { x: 15, y: 2 }, { x: 14, y: 2 }, { x: 13, y: 2 }, { x: 12, y: 2 }, { x: 11, y: 2 },
  // Top left
  { x: 11, y: 1 }, { x: 11, y: 0 }, { x: 11, y: -1 }, { x: 11, y: -2 }, { x: 11, y: -3 }, { x: 11, y: -4 },
  // Left row (blue start)
  { x: 10, y: -4 }, { x: 9, y: -4 }, { x: 8, y: -4 }, { x: 7, y: -4 }, { x: 6, y: -4 }, { x: 5, y: -4 },
  // Bottom left
  { x: 5, y: -3 }, { x: 5, y: -2 }, { x: 5, y: -1 }, { x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 },
  // Back to start
  { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 9, y: 2 }, { x: 10, y: 2 }, { x: 11, y: 2 }
];

// Home stretch positions for each color
const HOME_STRETCHES = {
  red: [
    { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 }
  ],
  green: [
    { x: 13, y: 8 }, { x: 14, y: 8 }, { x: 15, y: 8 }, { x: 16, y: 8 }, { x: 17, y: 8 }
  ],
  yellow: [
    { x: 16, y: 3 }, { x: 16, y: 4 }, { x: 16, y: 5 }, { x: 16, y: 6 }, { x: 16, y: 7 }
  ],
  blue: [
    { x: 9, y: -3 }, { x: 8, y: -3 }, { x: 7, y: -3 }, { x: 6, y: -3 }, { x: 5, y: -3 }
  ]
};

// Home positions for each color
const HOME_POSITIONS = {
  red: [
    { x: 4, y: 12 }, { x: 4, y: 13 }, { x: 5, y: 12 }, { x: 5, y: 13 }
  ],
  green: [
    { x: 13, y: 6 }, { x: 13, y: 7 }, { x: 14, y: 6 }, { x: 14, y: 7 }
  ],
  yellow: [
    { x: 18, y: 4 }, { x: 18, y: 5 }, { x: 19, y: 4 }, { x: 19, y: 5 }
  ],
  blue: [
    { x: 7, y: -2 }, { x: 7, y: -1 }, { x: 8, y: -2 }, { x: 8, y: -1 }
  ]
};

const LudoGame: React.FC = () => {
  // Game state
  const [players, setPlayers] = useState<Player[]>([
    {
      color: 'red',
      name: 'Red Player',
      pawns: [HOME_POSITION, HOME_POSITION, HOME_POSITION, HOME_POSITION],
      isActive: true,
      startPosition: 0,
      endPosition: 50,
      homeStretch: [51, 52, 53, 54, 55]
    },
    {
      color: 'green',
      name: 'Green Player',
      pawns: [HOME_POSITION, HOME_POSITION, HOME_POSITION, HOME_POSITION],
      isActive: true,
      startPosition: 13,
      endPosition: 11,
      homeStretch: [56, 57, 58, 59, 60]
    },
    {
      color: 'yellow',
      name: 'Yellow Player',
      pawns: [HOME_POSITION, HOME_POSITION, HOME_POSITION, HOME_POSITION],
      isActive: true,
      startPosition: 26,
      endPosition: 24,
      homeStretch: [61, 62, 63, 64, 65]
    },
    {
      color: 'blue',
      name: 'Blue Player',
      pawns: [HOME_POSITION, HOME_POSITION, HOME_POSITION, HOME_POSITION],
      isActive: true,
      startPosition: 39,
      endPosition: 37,
      homeStretch: [66, 67, 68, 69, 70]
    }
  ]);
  
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [selectedPawn, setSelectedPawn] = useState<number | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<{ playerIndex: number, name: string } | null>(null);
  
  const { addGameResult } = useGameHistory();

  // Initialize the game
  const initializeGame = () => {
    const initialPlayers = players.map(player => ({
      ...player,
      pawns: [HOME_POSITION, HOME_POSITION, HOME_POSITION, HOME_POSITION]
    }));
    
    setPlayers(initialPlayers);
    setCurrentPlayerIndex(0);
    setDiceValue(null);
    setSelectedPawn(null);
    setWinner(null);
  };

  // Roll the dice
  const rollDice = () => {
    if (isRolling || winner) return;
    
    setIsRolling(true);
    
    // Simulate rolling animation
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
    }, 100);
    
    // Stop rolling after a short delay
    setTimeout(() => {
      clearInterval(rollInterval);
      const finalValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(finalValue);
      setIsRolling(false);
      
      // Check if the player can move with this roll
      checkPossibleMoves(finalValue);
    }, 1000);
  };

  // Check possible moves
  const checkPossibleMoves = (value: number) => {
    const currentPlayer = players[currentPlayerIndex];
    
    // Check if any pawn can move
    const canMove = currentPlayer.pawns.some((pawnPosition, pawnIndex) => {
      // Can move out of home with a 6
      if (pawnPosition === HOME_POSITION && value === 6) {
        return true;
      }
      
      // Can move on the track
      if (pawnPosition !== HOME_POSITION && pawnPosition !== FINISHED_POSITION) {
        const newPosition = calculateNewPosition(pawnPosition, value, currentPlayer);
        return isValidMove(newPosition, currentPlayer);
      }
      
      return false;
    });
    
    // If can't move, go to next player after a delay
    if (!canMove) {
      setTimeout(() => {
        nextPlayer();
      }, 1500);
    }
  };

  // Calculate new position considering the circular track
  const calculateNewPosition = (currentPosition: number, steps: number, player: Player) => {
    if (currentPosition === HOME_POSITION) {
      return player.startPosition;
    }
    
    let newPosition = currentPosition + steps;
    
    // Check if pawn can enter home stretch
    if (currentPosition <= player.endPosition && newPosition > player.endPosition) {
      const remainingSteps = newPosition - player.endPosition - 1;
      return player.homeStretch[remainingSteps];
    }
    
    // Handle circular movement on main track
    if (newPosition >= BOARD_SIZE) {
      newPosition = newPosition - BOARD_SIZE;
    }
    
    return newPosition;
  };

  // Check if move is valid
  const isValidMove = (newPosition: number, player: Player) => {
    // Check if position is already occupied by same player
    const isOccupiedBySamePlayer = player.pawns.some(pawn => pawn === newPosition);
    if (isOccupiedBySamePlayer) return false;
    
    // Check if position is in home stretch
    if (player.homeStretch.includes(newPosition)) {
      const homeStretchIndex = player.homeStretch.indexOf(newPosition);
      // Check if any pawn is blocking the way in home stretch
      for (let i = 0; i < homeStretchIndex; i++) {
        if (player.pawns.includes(player.homeStretch[i])) return false;
      }
    }
    
    return true;
  };

  // Handle pawn selection
  const selectPawn = (pawnIndex: number) => {
    if (diceValue === null || winner) return;
    
    const currentPlayer = players[currentPlayerIndex];
    const pawnPosition = currentPlayer.pawns[pawnIndex];
    
    // Calculate new position
    const newPosition = calculateNewPosition(pawnPosition, diceValue, currentPlayer);
    
    // Check if move is valid
    if (isValidMove(newPosition, currentPlayer)) {
      movePawn(pawnIndex, newPosition);
    }
  };

  // Move a pawn
  const movePawn = (pawnIndex: number, newPosition: number) => {
    const updatedPlayers = [...players];
    const currentPlayer = {...updatedPlayers[currentPlayerIndex]};
    
    // Update pawn position
    currentPlayer.pawns[pawnIndex] = newPosition;
    
    // Check for captures
    checkForCaptures(newPosition);
    
    // Update players array
    updatedPlayers[currentPlayerIndex] = currentPlayer;
    setPlayers(updatedPlayers);
    
    // Check for win condition
    if (checkWinCondition(currentPlayer)) {
      setWinner(currentPlayer);
      addGameResult({
        gameName: 'Ludo',
        players: players.map(p => p.name),
        winner: currentPlayer.name
      });
    } else {
      // Go to next player unless rolled a 6
      if (diceValue !== 6) {
        nextPlayer();
      } else {
        setDiceValue(null);
      }
    }
  };

  // Check for captures
  const checkForCaptures = (position: number) => {
    const currentPlayer = players[currentPlayerIndex];
    
    players.forEach((player, playerIndex) => {
      if (playerIndex === currentPlayerIndex) return;
      
      player.pawns.forEach((pawnPosition, pawnIndex) => {
        if (pawnPosition === position) {
          const updatedPlayers = [...players];
          updatedPlayers[playerIndex].pawns[pawnIndex] = HOME_POSITION;
          setPlayers(updatedPlayers);
        }
      });
    });
  };

  // Check win condition
  const checkWinCondition = (player: Player) => {
    return player.pawns.every(position => 
      position === FINISHED_POSITION || player.homeStretch.includes(position)
    );
  };

  // Go to next player
  const nextPlayer = () => {
    setDiceValue(null);
    setSelectedPawn(null);
    
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    while (!players[nextIndex].isActive) {
      nextIndex = (nextIndex + 1) % players.length;
    }
    
    setCurrentPlayerIndex(nextIndex);
  };

  // Get color classes
  const getPlayerColorClass = (color: PlayerColor): string => {
    switch (color) {
      case 'red': return 'bg-red-500 text-white';
      case 'green': return 'bg-green-500 text-white';
      case 'yellow': return 'bg-yellow-500 text-white';
      case 'blue': return 'bg-blue-500 text-white';
    }
  };

  const getPlayerLightColorClass = (color: PlayerColor): string => {
    switch (color) {
      case 'red': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      case 'green': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200';
      case 'yellow': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
      case 'blue': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
    }
  };

  // Player name editing
  const startEditingPlayer = (playerIndex: number) => {
    setEditingPlayer({
      playerIndex,
      name: players[playerIndex].name
    });
  };

  const savePlayerName = () => {
    if (editingPlayer) {
      const updatedPlayers = [...players];
      updatedPlayers[editingPlayer.playerIndex].name = editingPlayer.name.trim() || 
        `${updatedPlayers[editingPlayer.playerIndex].color} Player`;
      
      setPlayers(updatedPlayers);
      setEditingPlayer(null);
    }
  };

  // Toggle player active state
  const togglePlayerActive = (playerIndex: number) => {
    const updatedPlayers = [...players];
    updatedPlayers[playerIndex].isActive = !updatedPlayers[playerIndex].isActive;
    
    // Ensure at least 2 players are active
    const activePlayers = updatedPlayers.filter(p => p.isActive).length;
    if (activePlayers < 2) {
      updatedPlayers[playerIndex].isActive = true;
      return;
    }
    
    // If current player is deactivated, move to next player
    if (playerIndex === currentPlayerIndex && !updatedPlayers[playerIndex].isActive) {
      let nextIndex = (currentPlayerIndex + 1) % players.length;
      while (!updatedPlayers[nextIndex].isActive) {
        nextIndex = (nextIndex + 1) % players.length;
      }
      setCurrentPlayerIndex(nextIndex);
    }
    
    setPlayers(updatedPlayers);
  };

  // Render board cell
  const renderBoardCell = (x: number, y: number) => {
    // Check if this is a track position
    const isTrackPosition = TRACK_POSITIONS.some(pos => pos.x === x && pos.y === y);
    
    // Check if this is a home stretch position
    const homeStretchInfo = Object.entries(HOME_STRETCHES).find(([color, positions]) =>
      positions.some(pos => pos.x === x && pos.y === y)
    );
    
    // Check if this is a home position
    const homeInfo = Object.entries(HOME_POSITIONS).find(([color, positions]) =>
      positions.some(pos => pos.x === x && pos.y === y)
    );
    
    let cellClass = 'w-8 h-8 border border-gray-200 dark:border-gray-700';
    
    if (isTrackPosition) {
      cellClass += ' bg-gray-100 dark:bg-gray-800';
    } else if (homeStretchInfo) {
      cellClass += ` ${getPlayerLightColorClass(homeStretchInfo[0] as PlayerColor)}`;
    } else if (homeInfo) {
      cellClass += ` ${getPlayerColorClass(homeInfo[0] as PlayerColor)}`;
    } else {
      cellClass += ' bg-white dark:bg-gray-900';
    }
    
    return (
      <div key={`${x}-${y}`} className={cellClass}>
        {renderPawnsAtPosition(x, y)}
      </div>
    );
  };

  // Render pawns at a specific position
  const renderPawnsAtPosition = (x: number, y: number) => {
    const pawns: JSX.Element[] = [];
    
    players.forEach((player, playerIndex) => {
      player.pawns.forEach((position, pawnIndex) => {
        if (position === HOME_POSITION) {
          // Check if this is the pawn's home position
          const homePos = HOME_POSITIONS[player.color].find((pos, idx) => 
            pos.x === x && pos.y === y && idx === pawnIndex
          );
          if (homePos) {
            pawns.push(renderPawn(playerIndex, pawnIndex));
          }
        } else if (position < BOARD_SIZE) {
          // Check if this is the pawn's track position
          const trackPos = TRACK_POSITIONS[position];
          if (trackPos.x === x && trackPos.y === y) {
            pawns.push(renderPawn(playerIndex, pawnIndex));
          }
        } else {
          // Check if this is the pawn's home stretch position
          const homeStretchPos = HOME_STRETCHES[player.color][position - BOARD_SIZE];
          if (homeStretchPos && homeStretchPos.x === x && homeStretchPos.y === y) {
            pawns.push(renderPawn(playerIndex, pawnIndex));
          }
        }
      });
    });
    
    return pawns;
  };

  // Render a pawn
  const renderPawn = (playerIndex: number, pawnIndex: number) => {
    const player = players[playerIndex];
    const position = player.pawns[pawnIndex];
    const isCurrentPlayer = playerIndex === currentPlayerIndex;
    const canMove = isCurrentPlayer && diceValue !== null &&
      (position === HOME_POSITION ? diceValue === 6 : true);
    
    return (
      <motion.div
        key={`pawn-${playerIndex}-${pawnIndex}`}
        className={`w-6 h-6 rounded-full ${getPlayerColorClass(player.color)} 
          shadow-md border border-white cursor-pointer
          ${canMove ? 'animate-pulse' : ''}`}
        whileHover={{ scale: canMove ? 1.2 : 1 }}
        onClick={() => canMove ? selectPawn(pawnIndex) : null}
      >
        {pawnIndex + 1}
      </motion.div>
    );
  };

  // Render dice
  const renderDice = () => {
    if (diceValue === null) return null;
    
    const dots = [];
    switch (diceValue) {
      case 1:
        dots.push(<div key="center" className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        break;
      case 2:
        dots.push(<div key="top-right" className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        dots.push(<div key="bottom-left" className="absolute bottom-2 left-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        break;
      case 3:
        dots.push(<div key="top-right" className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        dots.push(<div key="center" className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        dots.push(<div key="bottom-left" className="absolute bottom-2 left-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        break;
      case 4:
        dots.push(<div key="top-left" className="absolute top-2 left-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        dots.push(<div key="top-right" className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        dots.push(<div key="bottom-left" className="absolute bottom-2 left-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        dots.push(<div key="bottom-right" className="absolute bottom-2 right-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        break;
      case 5:
        dots.push(<div key="top-left" className="absolute top-2 left-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        dots.push(<div key="top-right" className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        dots.push(<div key="center" className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        dots.push(<div key="bottom-left" className="absolute bottom-2 left-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        dots.push(<div key="bottom-right" className="absolute bottom-2 right-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        break;
      case 6:
        dots.push(<div key="top-left" className="absolute top-2 left-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        dots.push(<div key="top-right" className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        dots.push(<div key="middle-left" className="absolute top-1/2 -translate-y-1/2 left-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        dots.push(<div key="middle-right" className="absolute top-1/2 -translate-y-1/2 right-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        dots.push(<div key="bottom-left" className="absolute bottom-2 left-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        dots.push(<div key="bottom-right" className="absolute bottom-2 right-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>);
        break;
    }
    
    return (
      <motion.div 
        className="w-14 h-14 bg-white rounded-lg shadow-lg relative"
        initial={{ rotate: 0 }}
        animate={{ rotate: isRolling ? [0, 360, 720, 1080] : 0 }}
        transition={{ duration: isRolling ? 1 : 0.3, ease: "easeInOut" }}
      >
        {dots}
      </motion.div>
    );
  };

  return (
    <div>
      <PageHeader 
        title="Ludo" 
        subtitle="Classic board game of chase and race"
        icon={<Dice5 size={32} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card p-6">
            {/* Game status display */}
            {winner ? (
              <motion.div 
                className="text-center mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`p-4 rounded-lg ${getPlayerLightColorClass(winner.color)}`}>
                  <Trophy className="inline-block mr-2 mb-1" />
                  <span className="font-bold">{winner.name}</span> wins!
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="text-center mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-lg font-medium mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Current turn: </span>
                  <span className={`font-bold ${players[currentPlayerIndex].color}`}>
                    {players[currentPlayerIndex].name}
                  </span>
                </div>
                
                {diceValue !== null ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {diceValue === 6 ? 
                      "Roll again or move a pawn" : 
                      "Select a pawn to move"
                    }
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Roll the dice to start your turn
                  </div>
                )}
              </motion.div>
            )}

            {/* Game board */}
            <div className="relative aspect-square max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-inner">
              <div className="absolute inset-0 grid grid-cols-24 grid-rows-24 gap-0">
                {Array.from({ length: 24 }, (_, y) =>
                  Array.from({ length: 24 }, (_, x) =>
                    renderBoardCell(x, y)
                  )
                )}
              </div>
              
              {/* Dice area */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="flex flex-col items-center space-y-4">
                  {renderDice()}
                  
                  {!winner && diceValue === null && (
                    <motion.button
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg shadow flex items-center"
                      onClick={rollDice}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isRolling}
                    >
                      Roll Dice
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <motion.button
                className="btn btn-primary flex items-center"
                onClick={initializeGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                New Game
              </motion.button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Players</h2>
            
            {players.map((player, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${getPlayerColorClass(player.color)} mr-2`}></div>
                    <span className="font-medium capitalize">{player.color}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => startEditingPlayer(index)}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => togglePlayerActive(index)}
                      className={`text-xs ${
                        player.isActive 
                          ? 'text-red-600 dark:text-red-400 hover:underline' 
                          : 'text-green-600 dark:text-green-400 hover:underline'
                      }`}
                    >
                      {player.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
                
                {editingPlayer?.playerIndex === index ? (
                  <div className="flex mt-2">
                    <input
                      type="text"
                      value={editingPlayer.name}
                      onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})}
                      className="flex-grow px-3 py-2 text-sm rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder={`Enter player name`}
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
                  <div className={`px-3 py-2 rounded-lg ${getPlayerLightColorClass(player.color)} ${!player.isActive ? 'opacity-50' : ''}`}>
                    {player.name}
                    {!player.isActive && <span className="ml-2 text-xs">(disabled)</span>}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">How to Play</h2>
            
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>1. Each player takes turns rolling the dice.</p>
              <p>2. Roll a 6 to move a pawn out of home.</p>
              <p>3. Move your pawns clockwise around the board.</p>
              <p>4. Enter your home stretch when you reach it.</p>
              <p>5. Land exactly on other players' pawns to send them home.</p>
              <p>6. Roll a 6 to get an extra turn.</p>
              <p>7. Get all four pawns to the finish to win!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap with GameProvider to ensure game history functionality
const LudoWithProvider: React.FC = () => (
  <GameProvider>
    <LudoGame />
  </GameProvider>
);

export default LudoWithProvider;