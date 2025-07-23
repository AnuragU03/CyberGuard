// src/components/dashboard/QuickActionCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const QuickActionCard = ({ title, icon, link, description }) => {
  return (
    <Link 
      to={link}
      className="bg-gray-800 rounded-lg shadow p-6 hover:bg-gray-700 transition-colors duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <p className="text-gray-400 mt-1 text-sm">{description}</p>
        </div>
        <div className="p-3 rounded-full bg-blue-900/30 text-blue-400">
          {icon}
        </div>
      </div>
      <div className="mt-4 text-blue-400 text-sm flex items-center">
        <span>Start now</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 ml-1" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </Link>
  );
};

export default QuickActionCard;
