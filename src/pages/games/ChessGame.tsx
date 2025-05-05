import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, AlertTriangle, Award, ChevronRight as ChessKnight, Trophy } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { GameProvider, useGameHistory } from '../../context/GameContext';

// Chess piece types
type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
type PieceColor = 'white' | 'black';

interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

type Board = (ChessPiece | null)[][];

// Game state
type GameState = 'playing' | 'check' | 'checkmate' | 'stalemate';

const ChessGame: React.FC = () => {
  // Players
  const [players, setPlayers] = useState<{ white: string, black: string }>({ white: 'Player 1', black: 'Player 2' });
  const [editingPlayer, setEditingPlayer] = useState<PieceColor | null>(null);
  const [editedName, setEditedName] = useState<string>('');
  
  // Game state
  const [board, setBoard] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white');
  const [gameState, setGameState] = useState<GameState>('playing');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  
  const { addGameResult } = useGameHistory();

  // Initialize the board
  useEffect(() => {
    initializeBoard();
  }, []);

  // Set up the initial board
  const initializeBoard = () => {
    const newBoard: Board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Set up pawns
    for (let i = 0; i < 8; i++) {
      newBoard[1][i] = { type: 'pawn', color: 'black' };
      newBoard[6][i] = { type: 'pawn', color: 'white' };
    }
    
    // Set up other pieces
    const setupRow = (row: number, color: PieceColor) => {
      newBoard[row][0] = { type: 'rook', color };
      newBoard[row][1] = { type: 'knight', color };
      newBoard[row][2] = { type: 'bishop', color };
      newBoard[row][3] = { type: 'queen', color };
      newBoard[row][4] = { type: 'king', color };
      newBoard[row][5] = { type: 'bishop', color };
      newBoard[row][6] = { type: 'knight', color };
      newBoard[row][7] = { type: 'rook', color };
    };
    
    setupRow(0, 'black');
    setupRow(7, 'white');
    
    setBoard(newBoard);
    setCurrentPlayer('white');
    setGameState('playing');
    setMoveHistory([]);
    setSelectedCell(null);
    setValidMoves([]);
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'playing' && gameState !== 'check') return;
    
    // If a cell is already selected
    if (selectedCell) {
      const [selectedRow, selectedCol] = selectedCell;
      
      // Check if the clicked cell is in valid moves
      const isValidMove = validMoves.some(([r, c]) => r === row && c === col);
      
      if (isValidMove) {
        // Move the piece
        const newBoard = [...board.map(row => [...row])];
        const piece = newBoard[selectedRow][selectedCol];
        
        if (!piece) return;
        
        // If it's a pawn, mark it as moved
        if (piece.type === 'pawn') {
          piece.hasMoved = true;
        }
        
        // If it's a king or rook, mark it as moved (for castling)
        if (piece.type === 'king' || piece.type === 'rook') {
          piece.hasMoved = true;
        }
        
        // Record the move
        const pieceSymbol = getPieceSymbol(piece.type);
        const fromCell = `${String.fromCharCode(97 + selectedCol)}${8 - selectedRow}`;
        const toCell = `${String.fromCharCode(97 + col)}${8 - row}`;
        const capturedPiece = newBoard[row][col] ? 'x' : '';
        
        const moveNotation = `${pieceSymbol}${fromCell}${capturedPiece}${toCell}`;
        setMoveHistory([...moveHistory, moveNotation]);
        
        // Execute the move
        newBoard[row][col] = piece;
        newBoard[selectedRow][selectedCol] = null;
        
        // Update the board
        setBoard(newBoard);
        
        // Switch player
        const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
        setCurrentPlayer(nextPlayer);
        
        // Check for check, checkmate, or stalemate
        // Note: In a real implementation, we would check for game ending conditions here
        
        // Reset selection
        setSelectedCell(null);
        setValidMoves([]);
      } else {
        // If the clicked cell contains a piece of the current player, select it
        const clickedPiece = board[row][col];
        
        if (clickedPiece && clickedPiece.color === currentPlayer) {
          setSelectedCell([row, col]);
          // In a real implementation, we would calculate valid moves here
          // For simplicity, we'll just allow any adjacent cells
          calculateValidMoves(row, col, clickedPiece);
        } else {
          // Deselect
          setSelectedCell(null);
          setValidMoves([]);
        }
      }
    } else {
      // No cell is selected, check if the clicked cell contains a piece of the current player
      const clickedPiece = board[row][col];
      
      if (clickedPiece && clickedPiece.color === currentPlayer) {
        setSelectedCell([row, col]);
        // Calculate valid moves for the selected piece
        calculateValidMoves(row, col, clickedPiece);
      }
    }
  };

  // Calculate valid moves for a piece (simplified)
  const calculateValidMoves = (row: number, col: number, piece: ChessPiece) => {
    // This is a simplified version that just allows adjacent moves
    // In a real chess game, this would be much more complex
    const moves: [number, number][] = [];
    
    // For demonstration, we'll implement basic moves for pawns only
    if (piece.type === 'pawn') {
      const direction = piece.color === 'white' ? -1 : 1;
      
      // Forward move
      if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
        moves.push([row + direction, col]);
        
        // Double move from starting position
        if (
          ((piece.color === 'white' && row === 6) || 
           (piece.color === 'black' && row === 1)) && 
          !board[row + 2 * direction][col] && 
          !board[row + direction][col]
        ) {
          moves.push([row + 2 * direction, col]);
        }
      }
      
      // Capture moves
      for (const offset of [-1, 1]) {
        if (col + offset >= 0 && col + offset < 8 && row + direction >= 0 && row + direction < 8) {
          const targetPiece = board[row + direction][col + offset];
          if (targetPiece && targetPiece.color !== piece.color) {
            moves.push([row + direction, col + offset]);
          }
        }
      }
    } else {
      // For other pieces, allow any empty cell or opponent's piece
      // This is very simplified and not accurate for real chess
      for (let r = Math.max(0, row - 1); r <= Math.min(7, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(7, col + 1); c++) {
          if (r === row && c === col) continue;
          
          const targetPiece = board[r][c];
          if (!targetPiece || targetPiece.color !== piece.color) {
            moves.push([r, c]);
          }
        }
      }
    }
    
    setValidMoves(moves);
  };

  // Get a symbol for chess notation
  const getPieceSymbol = (type: PieceType): string => {
    switch (type) {
      case 'king': return 'K';
      case 'queen': return 'Q';
      case 'rook': return 'R';
      case 'bishop': return 'B';
      case 'knight': return 'N';
      case 'pawn': return '';
    }
  };

  // Render a chess piece
  const renderPiece = (piece: ChessPiece | null) => {
    if (!piece) return null;
    
    const pieceSymbols: Record<PieceType, string> = {
      pawn: piece.color === 'white' ? '♙' : '♟',
      rook: piece.color === 'white' ? '♖' : '♜',
      knight: piece.color === 'white' ? '♘' : '♞',
      bishop: piece.color === 'white' ? '♗' : '♝',
      queen: piece.color === 'white' ? '♕' : '♛',
      king: piece.color === 'white' ? '♔' : '♚',
    };
    
    return (
      <div className={`piece text-4xl ${piece.color === 'white' ? 'text-white' : 'text-black'}`}>
        {pieceSymbols[piece.type]}
      </div>
    );
  };
  
  // Handle setting game state (check, checkmate, stalemate)
  const setGameEndState = (state: GameState) => {
    setGameState(state);
    
    if (state === 'checkmate') {
      // The winner is the player who made the last move
      const winner = currentPlayer === 'white' ? 'black' : 'white';
      
      // Add to game history
      addGameResult({
        gameName: 'Chess',
        players: [players.white, players.black],
        winner: players[winner]
      });
    }
  };

  // Restart the game
  const restartGame = () => {
    initializeBoard();
  };

  // Edit player name
  const startEditingPlayer = (color: PieceColor) => {
    setEditingPlayer(color);
    setEditedName(players[color]);
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

  // Simulate a move to demonstrate checkmate
  const simulateCheckmate = () => {
    setGameEndState('checkmate');
  };

  return (
    <div>
      <PageHeader 
        title="Chess" 
        subtitle="The classic game of strategy"
        icon={<ChessKnight size={32} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card p-6">
            {/* Game status display */}
            {gameState !== 'playing' && (
              <motion.div 
                className="text-center mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {gameState === 'check' && (
                  <div className="bg-warning-50 dark:bg-warning-900/20 text-warning-800 dark:text-warning-200 p-4 rounded-lg">
                    <AlertTriangle className="inline-block mr-2 mb-1" />
                    Check! {players[currentPlayer]}'s king is under attack!
                  </div>
                )}
                
                {gameState === 'checkmate' && (
                  <div className="bg-success-50 dark:bg-success-900/20 text-success-800 dark:text-success-200 p-4 rounded-lg">
                    <Trophy className="inline-block mr-2 mb-1" />
                    Checkmate! <span className="font-bold">{players[currentPlayer === 'white' ? 'black' : 'white']}</span> wins!
                  </div>
                )}
                
                {gameState === 'stalemate' && (
                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-4 rounded-lg">
                    Game ended in a stalemate!
                  </div>
                )}
              </motion.div>
            )}

            {/* Current player */}
            {(gameState === 'playing' || gameState === 'check') && (
              <motion.div 
                className="text-center mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-lg font-medium">
                  <span className="text-gray-600 dark:text-gray-300">Current turn: </span>
                  <span className={currentPlayer === 'white' ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}>
                    {players[currentPlayer]} ({currentPlayer})
                  </span>
                </div>
              </motion.div>
            )}

            {/* Chess board */}
            <div className="aspect-square max-w-md mx-auto">
              <div className="grid grid-cols-8 grid-rows-8 h-full w-full border border-gray-400 dark:border-gray-600">
                {board.map((row, rowIndex) => (
                  row.map((cell, colIndex) => {
                    // Determine if the cell is selected
                    const isSelected = selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex;
                    
                    // Determine if this is a valid move
                    const isValidMove = validMoves.some(([r, c]) => r === rowIndex && c === colIndex);
                    
                    // Determine the cell color (light or dark)
                    const isCellLight = (rowIndex + colIndex) % 2 === 1;
                    
                    return (
                      <div 
                        key={`${rowIndex}-${colIndex}`} 
                        className={`
                          relative flex items-center justify-center p-1
                          ${isCellLight 
                            ? 'bg-amber-100 dark:bg-amber-800'
                            : 'bg-amber-600 dark:bg-amber-950'}
                          ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''}
                          ${isValidMove ? 'ring-2 ring-green-500 z-10' : ''}
                        `}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        {renderPiece(cell)}
                        
                        {/* Cell coordinates (for debugging) */}
                        {/* <div className="absolute top-0 left-0 text-xs opacity-50">
                          {String.fromCharCode(97 + colIndex)}{8 - rowIndex}
                        </div> */}
                        
                        {/* Valid move indicator */}
                        {isValidMove && !cell && (
                          <div className="absolute w-3 h-3 rounded-full bg-green-500 opacity-60"></div>
                        )}
                        
                        {/* Valid capture indicator */}
                        {isValidMove && cell && (
                          <div className="absolute inset-0 border-2 border-green-500 rounded-sm opacity-60"></div>
                        )}
                      </div>
                    );
                  })
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <motion.button
                className="btn btn-primary flex items-center"
                onClick={restartGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                New Game
              </motion.button>
              
              {/* For demonstration purposes */}
              <motion.button
                className="btn btn-secondary flex items-center"
                onClick={simulateCheckmate}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Award className="mr-2 h-5 w-5" />
                Simulate Checkmate
              </motion.button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Players</h2>
            
            {/* White player */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-white border border-gray-300 rounded-full mr-2"></div>
                  <span className="font-medium">White</span>
                </div>
                <button 
                  onClick={() => startEditingPlayer('white')}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Edit
                </button>
              </div>
              
              {editingPlayer === 'white' ? (
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
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-200">
                  {players.white}
                </div>
              )}
            </div>
            
            {/* Black player */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-black border border-gray-300 rounded-full mr-2"></div>
                  <span className="font-medium">Black</span>
                </div>
                <button 
                  onClick={() => startEditingPlayer('black')}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Edit
                </button>
              </div>
              
              {editingPlayer === 'black' ? (
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
                <div className="px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg">
                  {players.black}
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Move History</h2>
            
            {moveHistory.length > 0 ? (
              <div className="h-64 overflow-y-auto pr-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 text-left font-medium text-gray-600 dark:text-gray-400 w-10">#</th>
                      <th className="py-2 text-left font-medium text-gray-600 dark:text-gray-400">Move</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moveHistory.map((move, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 text-gray-500 dark:text-gray-400">{index + 1}</td>
                        <td className="py-2 font-mono">{move}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                No moves yet
              </div>
            )}

            <div className="mt-6">
              <h3 className="font-medium mb-2">How to Play</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                This is a simplified version of chess. Click on a piece to see available moves, then click on a valid cell to move.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Note: This demo has simplified movement rules and doesn't check for all chess conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap with GameProvider to ensure game history functionality
const ChessWithProvider: React.FC = () => (
  <GameProvider>
    <ChessGame />
  </GameProvider>
);

export default ChessWithProvider;