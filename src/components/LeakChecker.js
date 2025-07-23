import React, { useState } from 'react';
import { 
  Database, 
  Mail, 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  Clipboard, 
  RefreshCw,
  DownloadCloud,
  Eye,
  AlertOctagon,
  Calendar
} from 'lucide-react';
import apiService from '../services/apiService';
import mcpService from '../services/mcpService';

const LeakChecker = () => {
  const [email, setEmail] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [checkHistory, setCheckHistory] = useState([]);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!email.trim() || !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsChecking(true);
    setError(null);
    setResults(null);

    try {
      let result;
      
      // Use MCP service if available, fallback to direct API
      if (mcpService.isConnected()) {
        result = await mcpService.checkEmailBreaches(email.trim());
      } else {
        result = await apiService.checkEmailLeaks(email.trim());
      }

      setResults({
        email: email.trim(),
        timestamp: new Date().toISOString(),
        breaches: result.breaches || [],
        pastes: result.pastes || [],
        leakCount: (result.breaches?.length || 0) + (result.pastes?.length || 0)
      });

      // Add to check history
      setCheckHistory(prev => [
        { 
          email: email.trim(),
          timestamp: new Date().toISOString(),
          leakCount: (result.breaches?.length || 0) + (result.pastes?.length || 0)
        }, 
        ...prev.slice(0, 9)
      ]);

    } catch (err) {
      setError(err.message || 'Failed to check for leaks');
      console.error('Leak check failed:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatBreachDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-900 border-red-700';
      case 'medium': return 'text-yellow-400 bg-yellow-900 border-yellow-700';
      case 'low': return 'text-green-400 bg-green-900 border-green-700';
      default: return 'text-gray-400 bg-gray-700 border-gray-600';
    }
  };

  const getSeverityBadge = (count) => {
    let severity = 'low';
    let text = 'Low Risk';
    
    if (count > 10) {
      severity = 'high';
      text = 'High Risk';
    } else if (count > 2) {
      severity = 'medium';
      text = 'Medium Risk';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${getSeverityColor(severity)}`}>
        {text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Email Leak Checker</h1>
        <p className="text-gray-400">
          Check if your email has been involved in data breaches or leaks
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <form onSubmit={handleCheck} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Enter email address to check
            </label>
            <div className="flex space-x-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  disabled={isChecking}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isChecking || !email.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isChecking ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>{isChecking ? 'Checking...' : 'Check'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isChecking && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-center space-x-3">
            <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
            <span className="text-white">Searching databases for leaks...</span>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Breach Database', 'Paste Sites', 'Dark Web', 'Public Leaks'].map((source) => (
              <div key={source} className="bg-gray-700 rounded p-3 flex items-center space-x-2">
                <div className="animate-pulse h-2 w-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-gray-300">{source}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Summary */}
          <div className={`rounded-lg p-6 border ${
            results.leakCount > 0 
              ? 'bg-red-900 border-red-700' 
              : 'bg-green-900 border-green-700'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                {results.leakCount > 0 ? (
                  <AlertOctagon className="h-8 w-8 text-red-400" />
                ) : (
                  <ShieldCheck className="h-8 w-8 text-green-400" />
                )}
                <div>
                  <h3 className="text-xl font-bold">
                    {results.leakCount > 0 
                      ? `Found in ${results.leakCount} data breaches` 
                      : 'No breaches found'}
                  </h3>
                  <p className={`${results.leakCount > 0 ? 'text-red-300' : 'text-green-300'}`}>
                    {results.leakCount > 0 
                      ? 'This email appears in several data breaches' 
                      : 'This email appears secure'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  results.leakCount > 0 
                    ? 'bg-red-800 text-red-200' 
                    : 'bg-green-800 text-green-200'
                }`}>
                  {results.email}
                </span>
                <button
                  onClick={() => copyToClipboard(results.email)}
                  className="p-1 text-gray-300 hover:text-white focus:outline-none"
                >
                  <Clipboard className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Breach Details */}
          {results.breaches.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-400" />
                <span>Data Breaches</span>
              </h3>
              <div className="space-y-4">
                {results.breaches.map((breach, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                      <div className="flex items-center space-x-3 mb-2 md:mb-0">
                        {breach.logo_path ? (
                          <img 
                            src={breach.logo_path} 
                            alt={breach.name} 
                            className="h-8 w-8 rounded"
                          />
                        ) : (
                          <AlertTriangle className="h-8 w-8 text-yellow-400" />
                        )}
                        <div>
                          <h4 className="font-semibold text-white">{breach.name}</h4>
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-400">
                              {formatBreachDate(breach.breach_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Affected Data Categories */}
                      <div>
                        {getSeverityBadge(breach.data_classes?.length || 0)}
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-3">
                      {breach.description || 'No description available'}
                    </p>
                    
                    {/* Data Classes */}
                    {breach.data_classes && breach.data_classes.length > 0 && (
                      <div>
                        <h5 className="text-sm text-gray-400 mb-2">Compromised Data:</h5>
                        <div className="flex flex-wrap gap-2">
                          {breach.data_classes.map((dataClass, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                              {dataClass}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paste Details */}
          {results.pastes?.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Eye className="h-5 w-5 text-purple-400" />
                <span>Paste Sites</span>
              </h3>
              <div className="space-y-4">
                {results.pastes.map((paste, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">
                        {paste.source || 'Unknown Source'}
                      </h4>
                      <span className="text-gray-400 text-sm">
                        {formatDate(paste.date)}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm truncate mb-2">
                      {paste.title || 'Untitled paste'}
                    </p>
                    {paste.emailCount && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400">
                          {paste.emailCount} email addresses exposed
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {results.leakCount > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-green-400" />
                <span>Recommended Actions</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-900 text-blue-300 rounded-full p-1 mt-0.5">
                    <span className="block h-5 w-5 text-center font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Change your password</h4>
                    <p className="text-gray-300 text-sm">
                      Update your password on all affected services immediately
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-900 text-blue-300 rounded-full p-1 mt-0.5">
                    <span className="block h-5 w-5 text-center font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Enable 2FA</h4>
                    <p className="text-gray-300 text-sm">
                      Turn on two-factor authentication for all important accounts
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-900 text-blue-300 rounded-full p-1 mt-0.5">
                    <span className="block h-5 w-5 text-center font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Use a password manager</h4>
                    <p className="text-gray-300 text-sm">
                      Generate unique passwords for every site and service
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-900 text-blue-300 rounded-full p-1 mt-0.5">
                    <span className="block h-5 w-5 text-center font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Monitor accounts</h4>
                    <p className="text-gray-300 text-sm">
                      Check bank and financial accounts for suspicious activity
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Results */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Save your leak check results</span>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(results, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `leak-check-${results.email.replace('@', '_at_')}-${Date.now()}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <DownloadCloud className="h-4 w-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check History */}
      {checkHistory.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Checks</h3>
          <div className="space-y-3">
            {checkHistory.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">{item.email}</p>
                  <p className="text-gray-400 text-sm">
                    {formatDate(item.timestamp)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs border ${
                    item.leakCount > 0 
                      ? 'bg-red-900 text-red-300 border-red-700' 
                      : 'bg-green-900 text-green-300 border-green-700'
                  }`}>
                    {item.leakCount > 0 
                      ? `${item.leakCount} breaches` 
                      : 'No breaches'}
                  </span>
                  <button
                    onClick={() => setEmail(item.email)}
                    className="text-blue-400 hover:text-blue-300 focus:outline-none"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeakChecker;