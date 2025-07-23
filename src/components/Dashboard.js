// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Database,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import apiService from '../services/apiService';
import storageService from '../services/storageService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalScans: 0,
    threatDetected: 0,
    safeUrls: 0,
    todayScans: 0
  });
  const [recentScans, setRecentScans] = useState([]);
  const [storageStats, setStorageStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data for charts
  const scanTrendData = [
    { name: 'Mon', scans: 12, threats: 2 },
    { name: 'Tue', scans: 19, threats: 3 },
    { name: 'Wed', scans: 8, threats: 1 },
    { name: 'Thu', scans: 27, threats: 4 },
    { name: 'Fri', scans: 18, threats: 2 },
    { name: 'Sat', scans: 15, threats: 1 },
    { name: 'Sun', scans: 22, threats: 3 }
  ];

  const threatDistribution = [
    { name: 'Safe', value: 85, color: '#10B981' },
    { name: 'Suspicious', value: 10, color: '#F59E0B' },
    { name: 'Malicious', value: 5, color: '#EF4444' }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load scan history
      const scanHistory = await apiService.getScanHistory(10);
      setRecentScans(scanHistory.results || []);
      
      // Calculate stats
      const totalScans = scanHistory.results?.length || 0;
      const threatDetected = scanHistory.results?.filter(scan => !scan.safe).length || 0;
      const safeUrls = totalScans - threatDetected;
      
      setStats({
        totalScans,
        threatDetected,
        safeUrls,
        todayScans: Math.floor(Math.random() * 20) + 5 // Mock data
      });

      // Load storage stats
      const storageData = storageService.getStorageStats();
      setStorageStats(storageData);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <Icon className={`h-8 w-8 text-${color}-500`} />
      </div>
    </div>
  );

  const getRiskBadge = (riskLevel) => {
    const styles = {
      low: 'bg-green-900 text-green-300 border-green-700',
      medium: 'bg-yellow-900 text-yellow-300 border-yellow-700',
      high: 'bg-red-900 text-red-300 border-red-700'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${styles[riskLevel] || styles.low}`}>
        {riskLevel?.toUpperCase() || 'SAFE'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Dashboard</h1>
          <p className="text-gray-400">Monitor your cybersecurity posture in real-time</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Shield className="h-5 w-5 text-green-400" />
          <span className="text-green-400 font-medium">System Secure</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Activity}
          title="Total Scans"
          value={stats.totalScans}
          subtitle="All time"
          color="blue"
        />
        <StatCard
          icon={AlertTriangle}
          title="Threats Detected"
          value={stats.threatDetected}
          subtitle="Blocked successfully"
          color="red"
        />
        <StatCard
          icon={CheckCircle}
          title="Safe URLs"
          value={stats.safeUrls}
          subtitle="Clean and verified"
          color="green"
        />
        <StatCard
          icon={Clock}
          title="Today's Scans"
          value={stats.todayScans}
          subtitle="Last 24 hours"
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan Trends */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Scan Activity</h3>
            <TrendingUp className="h-5 w-5 text-blue-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={scanTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="scans" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="threats" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Threat Distribution */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Threat Distribution</h3>
            <Database className="h-5 w-5 text-blue-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={threatDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={false}
              >
                {threatDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scans */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Scans</h3>
            <Activity className="h-5 w-5 text-blue-400" />
          </div>
          <div className="space-y-3">
            {recentScans.length > 0 ? (
              recentScans.slice(0, 5).map((scan, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{scan.url}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(scan.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="ml-4">
                    {getRiskBadge(scan.riskLevel)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No recent scans available</p>
                <p className="text-gray-500 text-sm mt-1">Start scanning URLs to see activity here</p>
              </div>
            )}
          </div>
        </div>

        {/* Storage Stats */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Storage Status</h3>
            <Zap className="h-5 w-5 text-blue-400" />
          </div>
          {storageStats ? (
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Total Entries</p>
                <p className="text-2xl font-bold text-blue-400">{storageStats.totalEntries}</p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">By Type</p>
                {Object.entries(storageStats.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="text-gray-300 capitalize">{type.replace('_', ' ')}</span>
                    <span className="text-blue-400">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">No storage data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
