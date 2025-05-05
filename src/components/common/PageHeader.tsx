import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon }) => {
  return (
    <motion.div 
      className="mb-8 flex flex-col"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Link 
          to="/"
          className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span className="text-sm">Back</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-3">
        {icon && <div className="text-primary-600 dark:text-primary-400">{icon}</div>}
        <div>
          <h1 className="game-title">{title}</h1>
          {subtitle && <p className="game-subtitle">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default PageHeader;