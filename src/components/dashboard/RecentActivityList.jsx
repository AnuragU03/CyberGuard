// src/components/dashboard/RecentActivityList.jsx
import React from 'react';

const RecentActivityList = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-800 rounded-lg">
        <p className="text-gray-400">No recent activity found</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'alert': return 'bg-red-500';
      case 'pending': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <ul className="divide-y divide-gray-700">
        {activities.map((activity, index) => (
          <li key={index} className="px-4 py-4 hover:bg-gray-750 transition-colors duration-150">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-3 w-3 rounded-full ${getStatusColor(activity.status)}`}></div>
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivityList;
