// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApiQuery } from '../hooks/useApi';
import { 
  ShieldCheck, 
  Scan, 
  Activity, 
  Database, 
  Bell, 
  Lock, 
  Globe, 
  Settings, 
  HelpCircle 
} from 'lucide-react';
import SecuritySummaryCard from '../components/dashboard/SecuritySummaryCard';
import QuickActionCard from '../components/dashboard/QuickActionCard';
import RecentActivityList from '../components/dashboard/RecentActivityList';

// Function to fetch dashboard data from the backend
const fetchDashboardApiFn = async () => {
  const response = await fetch('/api/dashboard', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // if you need cookies/auth
  });
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  return response.json();
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [securitySummary, setSecuritySummary] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // API call to fetch dashboard data
  const { data, error, refetch } = useApiQuery('/api/dashboard', fetchDashboardApiFn);
  
  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (data) {
      setSecuritySummary(data.securitySummary);
      setRecentActivities(data.recentActivities);
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      console.error('Failed to fetch dashboard data:', error);
      setIsLoading(false);
    }
  }, [error]);

  // Removed fetchDashboardData, use refetch directly

  const quickActions = [
    { 
      id: 'url-scan', 
      title: 'Scan URL', 
      icon: <Scan className="h-6 w-6" />,
      link: '/url-scanner',
      description: 'Scan a URL for security threats'
    },
    { 
      id: 'leak-check', 
      title: 'Check for Leaks', 
      icon: <Database className="h-6 w-6" />,
      link: '/leak-checker',
      description: 'Check if your data has been compromised'
    },
    { 
      id: 'monitor', 
      title: 'Background Monitor', 
      icon: <Activity className="h-6 w-6" />,
      link: '/monitor',
      description: 'Monitor background processes'
    },
    { 
      id: 'incident', 
      title: 'Report Incident', 
      icon: <Bell className="h-6 w-6" />,
      link: '/incident-reporter',
      description: 'Report a security incident'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {currentUser?.name || 'User'}!
        </h1>
        <p className="mt-2 text-lg text-gray-300">
          Here's your security overview
        </p>
      </div>

      {/* Security Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SecuritySummaryCard 
          title="Total Scans" 
          value={securitySummary?.totalScans || 0} 
          icon={<Scan className="h-6 w-6" />} 
          trend={securitySummary?.scanTrend || 'neutral'}
        />
        <SecuritySummaryCard 
          title="Threats Detected" 
          value={securitySummary?.threatsDetected || 0} 
          icon={<ShieldCheck className="h-6 w-6" />} 
          trend={securitySummary?.threatTrend || 'neutral'}
          isDanger={true}
        />
        <SecuritySummaryCard 
          title="Data Leaks" 
          value={securitySummary?.dataLeaks || 0} 
          icon={<Database className="h-6 w-6" />} 
          trend={securitySummary?.leakTrend || 'neutral'}
        />
        <SecuritySummaryCard 
          title="System Health" 
          value={`${securitySummary?.systemHealth || 0}%`} 
          icon={<Activity className="h-6 w-6" />} 
          trend={securitySummary?.healthTrend || 'neutral'}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <QuickActionCard 
              key={action.id}
              title={action.title}
              icon={action.icon}
              link={action.link}
              description={action.description}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Security Activity</h2>
          <Link to="/activity" className="text-blue-400 hover:text-blue-300 text-sm">
            View all activity
          </Link>
        </div>
        <RecentActivityList activities={recentActivities} />
      </div>

      {/* Security Tips */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Security Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start">
            <Lock className="h-5 w-5 text-blue-400 mt-1 mr-3" />
            <div>
              <h3 className="font-medium text-white">Enable Two-Factor Authentication</h3>
              <p className="text-gray-400 text-sm mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <Globe className="h-5 w-5 text-blue-400 mt-1 mr-3" />
            <div>
              <h3 className="font-medium text-white">Check Privacy Settings</h3>
              <p className="text-gray-400 text-sm mt-1">
                Review your data sharing preferences
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <Settings className="h-5 w-5 text-blue-400 mt-1 mr-3" />
            <div>
              <h3 className="font-medium text-white">Update Software</h3>
              <p className="text-gray-400 text-sm mt-1">
                Ensure your system has the latest security patches
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center text-gray-400">
          <HelpCircle className="h-5 w-5 mr-2" />
          <p>
            Need help? Contact our <Link to="/support" className="text-blue-400 hover:text-blue-300">support team</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
