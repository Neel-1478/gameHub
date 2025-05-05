import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, icon, path, color }) => {
  return (
    <Link to={path}>
      <motion.div 
        className={`game-card card ${color} h-full`}
        whileHover={{ scale: 1.02, y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-6 flex flex-col items-center text-center h-full">
          <div className="mb-4 p-3 rounded-full bg-opacity-10 bg-current">
            {icon}
          </div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{description}</p>
          <motion.div 
            className="mt-auto px-4 py-2 rounded-lg bg-white dark:bg-gray-700 bg-opacity-20 dark:bg-opacity-20 text-sm font-medium"
            whileHover={{ scale: 1.05 }}
          >
            Play Now
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
};

export default GameCard;