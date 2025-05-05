import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout components
import Layout from './components/layout/Layout';

// Page components
import Home from './pages/Home';
import Ledger from './pages/Ledger';
import NotFound from './pages/NotFound';

// Game components
import ChessGame from './pages/games/ChessGame';
import LudoGame from './pages/games/LudoGame';
import SnakeGame from './pages/games/SnakeGame';
import TicTacToeGame from './pages/games/TicTacToeGame';

// Context
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/chess" element={<ChessGame />} />
            <Route path="/ludo" element={<LudoGame />} />
            <Route path="/snake" element={<SnakeGame />} />
            <Route path="/tictactoe" element={<TicTacToeGame />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </ThemeProvider>
  );
}

export default App;