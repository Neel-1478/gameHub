import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, Medal, Users, Trash2, Trophy } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { useGameHistory } from '../context/GameContext';

// Import your game provider here to wrap the component
import { GameProvider } from '../context/GameContext';

interface PlayerStats {
  name: string;
  wins: number;
  gamesPlayed: number;
}

const Ledger: React.FC = () => {
  const { gameHistory, clearHistory } = useGameHistory();
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [sortBy, setSortBy] = useState<'wins' | 'winRate'>('wins');

  useEffect(() => {
    // Calculate player statistics
    const players = new Map<string, PlayerStats>();
    
    gameHistory.forEach(game => {
      game.players.forEach(player => {
        if (!players.has(player)) {
          players.set(player, { name: player, wins: 0, gamesPlayed: 0 });
        }
        
        const stats = players.get(player)!;
        stats.gamesPlayed += 1;
        
        if (player === game.winner) {
          stats.wins += 1;
        }
        
        players.set(player, stats);
      });
    });
    
    // Convert Map to array and sort by wins
    let statsArray = Array.from(players.values());
    sortStats(statsArray, sortBy);
    setPlayerStats(statsArray);
  }, [gameHistory, sortBy]);

  const sortStats = (stats: PlayerStats[], by: 'wins' | 'winRate') => {
    if (by === 'wins') {
      stats.sort((a, b) => b.wins - a.wins);
    } else {
      stats.sort((a, b) => {
        const aRate = a.gamesPlayed > 0 ? a.wins / a.gamesPlayed : 0;
        const bRate = b.gamesPlayed > 0 ? b.wins / b.gamesPlayed : 0;
        return bRate - aRate;
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <PageHeader 
        title="Game Ledger" 
        subtitle="Track your games and see who's winning"
        icon={<Trophy size={32} />}
      />

      {playerStats.length > 0 ? (
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Award className="mr-2 text-amber-500" size={24} />
              Leaderboard
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setSortBy('wins')}
                className={`px-3 py-1 rounded text-sm ${sortBy === 'wins' 
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              >
                Total Wins
              </button>
              <button 
                onClick={() => setSortBy('winRate')}
                className={`px-3 py-1 rounded text-sm ${sortBy === 'winRate' 
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              >
                Win Rate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playerStats.map((player, index) => (
              <motion.div 
                key={player.name}
                className="card p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-bold">{player.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{player.gamesPlayed} games played</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{player.wins}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {player.gamesPlayed > 0 
                        ? Math.round((player.wins / player.gamesPlayed) * 100) 
                        : 0}% win rate
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="card p-8 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <p className="text-gray-600 dark:text-gray-400">No game history yet. Start playing to track your results!</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Calendar className="mr-2 text-blue-500" size={24} />
            Game History
          </h2>
          {gameHistory.length > 0 && (
            <button 
              onClick={clearHistory}
              className="flex items-center px-3 py-1 rounded text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/30"
            >
              <Trash2 size={16} className="mr-1" />
              Clear History
            </button>
          )}
        </div>

        {gameHistory.length > 0 ? (
          <div className="space-y-4">
            {gameHistory.map((game, index) => (
              <motion.div 
                key={index}
                className="card p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * Math.min(index, 5) }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{game.gameName}</h3>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <Users size={16} className="mr-1" />
                      <span>{game.players.join(', ')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-amber-600 dark:text-amber-400 font-medium">
                      <Medal size={16} className="mr-1" />
                      <span>{game.winner}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(game.date)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No games recorded yet. Play some games to see your history!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Wrap the component with the GameProvider
const LedgerWithProvider: React.FC = () => (
  <GameProvider>
    <Ledger />
  </GameProvider>
);

export default LedgerWithProvider;