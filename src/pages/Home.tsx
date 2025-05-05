import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight as ChessKnight, Trophy, Joystick, X } from 'lucide-react';
import GameCard from '../components/common/GameCard';

const Home: React.FC = () => {
  const games = [
    {
      title: 'Chess',
      description: 'Strategic board game for 2 players with pieces on a checkered board.',
      icon: <ChessKnight size={36} className="text-purple-500" />,
      path: '/chess',
      color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
    },
    {
      title: 'Snake',
      description: 'Control a snake to eat food and grow without hitting walls or yourself.',
      icon: <Joystick size={36} className="text-green-500" />,
      path: '/snake',
      color: 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    },
    {
      title: 'Tic-tac-toe',
      description: 'Simple game of X and O for 2 players on a 3×3 grid.',
      icon: <X size={36} className="text-red-500" />,
      path: '/tictactoe',
      color: 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    },
    {
      title: 'Game Ledger',
      description: 'Track your wins and game history with friends.',
      icon: <Trophy size={36} className="text-amber-500" />,
      path: '/ledger',
      color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',
    }
  ];

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div>
      <motion.section 
        className="text-center mb-16"
        initial="hidden"
        animate="visible"
        variants={heroVariants}
      >
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-4"
          variants={itemVariants}
        >
          Pass & Play Games
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          Play classic games with friends on a single device. Challenge each other and track your wins!
        </motion.p>
      </motion.section>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {games.map((game, index) => (
          <motion.div 
            key={game.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
          >
            <GameCard
              title={game.title}
              description={game.description}
              icon={game.icon}
              path={game.path}
              color={game.color}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Home;