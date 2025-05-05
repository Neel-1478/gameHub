import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <span className="text-9xl font-bold text-gray-200 dark:text-gray-800">404</span>
      <h1 className="text-3xl font-bold mt-4">Page Not Found</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
        Oops! The game you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="mt-8 inline-flex items-center btn btn-primary"
      >
        <Home className="mr-2 w-5 h-5" />
        Return Home
      </Link>
    </motion.div>
  );
};

export default NotFound;