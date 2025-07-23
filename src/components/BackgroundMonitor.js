import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  PlayCircle, 
  StopCircle, 
  Wifi, 
  Activity, 
  AlertCircle, 
  Eye,
  Clock,
  Trash2,
  Settings
} from 'lucide-react';
import apiService from '../services/apiService';
import mcpService from '../services/mcpService';

const BackgroundMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoredUrls, setMonitoredUrls] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [alertHistory, setAlertHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    checkInterval: 30, // minutes
    notificationsEnabled: true,
    autoScanLinks: true,
    detectionThreshold: 'medium' // low, medium, high
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load saved monitored URLs
    const loadMonitoredUrls = async () => {
      try {
        const response = await apiService.getScanHistory(50);
        if (response?.results) {
          // Extract unique URLs that have been scanned
          const uniqueUrls = [...new Set(response.results.map(scan => scan.url))];
          setMonitoredUrls(uniqueUrls.slice(0, 5).map(url => ({
            url,
            lastChecked: null,
            status: 'pending',
            addedAt: new Date().toISOString()
          })));
        }
      } catch (error) {
        console.error('Failed to load monitored URLs:', error);
      }
    };

    loadMonitoredUrls();
  }, []);

  const startMonitoring = async () => {
    if (monitoredUrls.length === 0) {
      setError('Add at least one URL to monitor');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const options = {
        urls: monitoredUrls.map(item => item.url),
        interval: settings.checkInterval * 60, // convert to seconds
        threshold: settings.detectionThreshold
      };

      let result;
      if (mcpService.isConnected()) {
        result = await mcpService.startBackgroundMonitoring(options);
      } else {
        result = await apiService.startBackgroundMonitoring(options);
      }

      if (result.success) {
        setIsMonitoring(true);
        
        // Update URLs with monitoring status
        setMonitoredUrls(prev => prev.map(item => ({
          ...item,
          status: 'monitoring',
          lastChecked: new Date().toISOString()
        })));
      } else {
        setError('Failed to start monitoring');
      }
    } catch (error) {
      setError(`Error starting monitor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const stopMonitoring = async () => {
    setLoading(true);
    try {
      let result;
      if (mcpService.isConnected()) {
        result = await mcpService.stopBackgroundMonitoring();
      } else {
        result = await apiService.stopBackgroundMonitoring();
      }

      if (result.success) {
        setIsMonitoring(false);
        
        // Update URLs with stopped status
        setMonitoredUrls(prev => prev.map(item => ({
          ...item,
          status: 'stopped'
        })));
      } else {
        setError('Failed to stop monitoring');
      }
    } catch (error) {
      setError(`Error stopping monitor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addUrl = () => {
    if (!newUrl.trim()) return;
    
    // Simple URL validation
    if (!/^https?:\/\/.+/.test(newUrl)) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    
    // Check for duplicates
    if (monitoredUrls.some(item => item.url === newUrl)) {
      setError('This URL is already being monitored');
      return;
    }
    
    setMonitoredUrls(prev => [
      ...prev, 
      {
        url: newUrl,
        lastChecked: null,
        status: isMonitoring ? 'monitoring' : 'pending',
        addedAt: new Date().toISOString()
      }
    ]);
    setNewUrl('');
    setError(null);
  };

  const removeUrl = (urlToRemove) => {
    setMonitoredUrls(prev => prev.filter(item => item.url !== urlToRemove));
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'monitoring': return 'text-green-400';
      case 'alert': return 'text-red-400';
      case 'stopped': return 'text-gray-400';
      default: return 'text-yellow-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Background URL Monitor</h1>
        <p className="text-gray-400">Continuously monitor URLs for security changes and get alerts</p>
      </div>

      {/* Control Panel */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className={`h-3 w-3 rounded-full ${isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="font-medium text-white">
              {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>

            {isMonitoring ? (
              <button
                onClick={stopMonitoring}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                <StopCircle className="h-4 w-4" />
                <span>Stop Monitoring</span>
              </button>
            ) : (
              <button
                onClick={startMonitoring}
                disabled={loading || monitoredUrls.length === 0}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Start Monitoring</span>
              </button>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-700 rounded-lg">
            <h3 className="font-medium text-white mb-3">Monitor Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Check Interval (minutes)</label>
                <input
                  type="number"
                  name="checkInterval"
                  value={settings.checkInterval}
                  onChange={handleSettingsChange}
                  min="5"
                  max="1440"
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">Detection Threshold</label>
                <select
                  name="detectionThreshold"
                  value={settings.detectionThreshold}
                  onChange={handleSettingsChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="low">Low (More Alerts)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Critical Only)</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notificationsEnabled"
                  name="notificationsEnabled"
                  checked={settings.notificationsEnabled}
                  onChange={handleSettingsChange}
                  className="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-800"
                />
                <label htmlFor="notificationsEnabled" className="text-sm text-gray-300">
                  Enable Desktop Notifications
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoScanLinks"
                  name="autoScanLinks"
                  checked={settings.autoScanLinks}
                  onChange={handleSettingsChange}
                  className="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-800"
                />
                <label htmlFor="autoScanLinks" className="text-sm text-gray-300">
                  Auto-scan URLs from Clipboard
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* URL Management */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="font-medium text-white mb-4">Monitored URLs</h3>
        
        {/* Add URL Form */}
        <div className="flex space-x-3 mb-4">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addUrl}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add URL
          </button>
        </div>
        
        {/* URL List */}
        {monitoredUrls.length > 0 ? (
          <div className="space-y-3">
            {monitoredUrls.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate">{item.url}</p>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className={`${getStatusColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">
                      Last Check: {formatDate(item.lastChecked)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeUrl(item.url)}
                  className="ml-3 p-1 text-gray-400 hover:text-red-400 focus:outline-none"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            <Monitor className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No URLs added to monitoring</p>
            <p className="text-sm text-gray-500 mt-1">
              Add URLs above to begin monitoring them
            </p>
          </div>
        )}
      </div>

      {/* Alert History */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="font-medium text-white mb-4">Recent Alerts</h3>
        
        {alertHistory.length > 0 ? (
          <div className="space-y-3">
            {alertHistory.map((alert, index) => (
              <div key={index} className="p-3 bg-gray-700 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="text-white font-medium">{alert.title}</p>
                </div>
                <p className="text-gray-300 mb-2">{alert.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <a 
                    href={alert.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {alert.url}
                  </a>
                  <span className="text-gray-400">{formatDate(alert.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No alerts detected</p>
            <p className="text-sm text-gray-500 mt-1">
              We'll notify you when we detect changes in your monitored URLs
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundMonitor;