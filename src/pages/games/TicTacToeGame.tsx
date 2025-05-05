import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Circle, RotateCcw, Trophy } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { GameProvider, useGameHistory } from '../../context/GameContext';

type Player = 'X' | 'O';
type BoardState = (Player | null)[];
type GameStatus = 'playing' | 'won' | 'draw';

const TicTacToeGame: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [winner, setWinner] = useState<Player | null>(null);
  const [players, setPlayers] = useState<{ X: string, O: string }>({ X: 'Player 1', O: 'Player 2' });
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editedName, setEditedName] = useState<string>('');

  const { addGameResult } = useGameHistory();

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  useEffect(() => {
    checkGameStatus();
  }, [board]);

  const handleCellClick = (index: number) => {
    if (board[index] || gameStatus !== 'playing') return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  const checkGameStatus = () => {
    // Check for winner
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setGameStatus('won');
        setWinner(board[a] as Player);
        
        // Add to game history
        addGameResult({
          gameName: 'Tic-tac-toe',
          players: [players.X, players.O],
          winner: players[board[a] as Player]
        });
        
        return;
      }
    }

    // Check for draw
    if (!board.includes(null)) {
      setGameStatus('draw');
      return;
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setGameStatus('playing');
    setWinner(null);
  };

  const startEditingPlayer = (player: Player) => {
    setEditingPlayer(player);
    setEditedName(players[player]);
  };

  const savePlayerName = () => {
    if (editingPlayer && editedName.trim()) {
      setPlayers({
        ...players,
        [editingPlayer]: editedName.trim()
      });
    }
    setEditingPlayer(null);
  };

  const renderCell = (index: number) => {
    return (
      <motion.div
        key={index}
        className="w-full h-full bg-white dark:bg-gray-800 rounded-md shadow-sm flex items-center justify-center cursor-pointer text-4xl sm:text-5xl md:text-6xl"
        whileHover={{ scale: board[index] ? 1 : 1.05 }}
        whileTap={{ scale: board[index] ? 1 : 0.95 }}
        onClick={() => handleCellClick(index)}
      >
        {board[index] === 'X' && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-red-500 dark:text-red-400"
          >
            <X strokeWidth={3} />
          </motion.div>
        )}
        {board[index] === 'O' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-blue-500 dark:text-blue-400"
          >
            <Circle strokeWidth={3} />
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div>
      <PageHeader 
        title="Tic-tac-toe" 
        subtitle="Classic game of X's and O's"
        icon={<X size={32} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card p-6">
            {gameStatus !== 'playing' ? (
              <motion.div 
                className="text-center mb-4 p-4 rounded-lg"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {gameStatus === 'won' ? (
                  <div className="bg-success-50 dark:bg-success-900/20 text-success-800 dark:text-success-200 p-4 rounded-lg">
                    <Trophy className="inline-block mr-2 mb-1" />
                    <span className="font-bold">{players[winner as Player]}</span> wins!
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-4 rounded-lg">
                    Game ended in a draw!
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                className="text-center mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-lg font-medium">
                  <span className="text-gray-600 dark:text-gray-300">Current turn: </span>
                  <span className={currentPlayer === 'X' ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}>
                    {players[currentPlayer]} ({currentPlayer})
                  </span>
                </div>
              </motion.div>
            )}

            <div className="aspect-square">
              <div className="grid grid-cols-3 grid-rows-3 gap-2 h-full w-full">
                {Array(9).fill(null).map((_, index) => renderCell(index))}
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <motion.button
                className="btn btn-primary flex items-center"
                onClick={resetGame}
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
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Players</h2>
            
            {/* Player X */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <X className="w-5 h-5 text-red-500 mr-2" />
                  <span className="font-medium">Player X</span>
                </div>
                <button 
                  onClick={() => startEditingPlayer('X')}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Edit
                </button>
              </div>
              
              {editingPlayer === 'X' ? (
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
                <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-800 dark:text-red-200">
                  {players.X}
                </div>
              )}
            </div>
            
            {/* Player O */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Circle className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="font-medium">Player O</span>
                </div>
                <button 
                  onClick={() => startEditingPlayer('O')}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Edit
                </button>
              </div>
              
              {editingPlayer === 'O' ? (
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
                  {players.O}
                </div>
              )}
            </div>

            <div className="mt-8">
              <h3 className="font-medium mb-2">How to Play</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Take turns placing your mark (X or O) on the board</li>
                <li>• Get three of your marks in a row (horizontally, vertically, or diagonally) to win</li>
                <li>• If all spaces are filled and no player has three in a row, the game ends in a draw</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap with GameProvider to ensure game history functionality
const TicTacToeWithProvider: React.FC = () => (
  <GameProvider>
    <TicTacToeGame />
  </GameProvider>
);

export default TicTacToeWithProvider;