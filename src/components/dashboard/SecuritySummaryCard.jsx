// src/components/dashboard/SecuritySummaryCard.jsx
import React from 'react';

const SecuritySummaryCard = ({ title, value, icon, trend, isDanger = false }) => {
  // Determine trend styling
  const trendClass = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  }[trend] || 'text-gray-500';
  
  const trendIcon = {
    up: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    ),
    down: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
    neutral: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
      </svg>
    )
  }[trend] || null;

  return (
    <div className={`bg-gray-800 rounded-lg shadow p-6 ${isDanger && value > 0 ? 'border border-red-500' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-300">{title}</h3>
          <p className={`text-2xl font-bold mt-1 ${isDanger && value > 0 ? 'text-red-400' : 'text-white'}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${isDanger && value > 0 ? 'bg-red-900/30' : 'bg-blue-900/30'}`}>
          {icon}
        </div>
      </div>
      
      {trend && trend !== 'neutral' && (
        <div className="mt-4 flex items-center">
          <span className={trendClass}>
            {trendIcon}
          </span>
          <span className={`ml-1 text-sm ${trendClass}`}>
            {trend === 'up' ? 'Increased' : 'Decreased'} since last week
          </span>
        </div>
      )}
    </div>
  );
};

export default SecuritySummaryCard;
