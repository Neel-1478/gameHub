import React, { createContext, useContext, useEffect, useState } from 'react';

interface GameScore {
  gameName: string;
  players: string[];
  winner: string;
  date: string;
}

interface GameContextType {
  gameHistory: GameScore[];
  addGameResult: (result: Omit<GameScore, 'date'>) => void;
  clearHistory: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameHistory, setGameHistory] = useState<GameScore[]>(() => {
    const savedHistory = localStorage.getItem('gameHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  useEffect(() => {
    localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
  }, [gameHistory]);

  const addGameResult = (result: Omit<GameScore, 'date'>) => {
    const gameResult: GameScore = {
      ...result,
      date: new Date().toISOString(),
    };
    setGameHistory(prev => [gameResult, ...prev]);
  };

  const clearHistory = () => {
    setGameHistory([]);
  };

  return (
    <GameContext.Provider value={{ gameHistory, addGameResult, clearHistory }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameHistory = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameHistory must be used within a GameProvider');
  }
  return context;
};