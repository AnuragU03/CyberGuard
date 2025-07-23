import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Database, 
  File, 
  Trash2, 
  Download, 
  RefreshCw, 
  Search, 
  AlertTriangle,
  Filter,
  Clock,
  Lock,
  ExternalLink,
  Info,
  Shield,
  ArrowUpDown,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import storageService from '../services/storageService';
import mcpService from '../services/mcpService';

const StorageManager = () => {
  const [storedData, setStoredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalSize: 0,
    byType: {}
  });

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const index = storageService.getLocalIndex();
      
      // Calculate basic stats from index
      const typeCount = index.reduce((acc, item) => {
        const type = item.metadata?.type || 'other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      setStats({
        totalItems: index.length,
        totalSize: 0, // We don't have size info in the index
        byType: typeCount
      });
      
      setStoredData(index.map(item => ({
        ...item,
        type: item.metadata?.type || 'other',
        details: null, // Will be loaded on demand
        isLoading: false
      })));
    } catch (err) {
      setError('Failed to load storage index: ' + err.message);
      console.error('Storage index load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadItemDetails = async (cid, index) => {
    const updatedData = [...storedData];
    updatedData[index] = {
      ...updatedData[index],
      isLoading: true
    };
    setStoredData(updatedData);
    
    try {
      let result;
      if (mcpService.isConnected()) {
        result = await mcpService.retrieveDataIPFS(cid);
      } else {
        result = await storageService.retrieveDataIPFS(cid);
      }
      
      updatedData[index] = {
        ...updatedData[index],
        details: result.data,
        isLoading: false
      };
      setStoredData(updatedData);
      
    } catch (err) {
      console.error('Failed to load item details:', err);
      updatedData[index] = {
        ...updatedData[index],
        isLoading: false,
        error: err.message
      };
      setStoredData(updatedData);
    }
  };

  const toggleExpandItem = (cid, index) => {
    setExpandedItems(prev => {
      const newState = {
        ...prev,
        [cid]: !prev[cid]
      };
      
      // Load details if expanding and not already loaded
      if (newState[cid] && !storedData[index].details && !storedData[index].isLoading) {
        loadItemDetails(cid, index);
      }
      
      return newState;
    });
  };

  const handleDeleteItem = async (cid) => {
    if (deleteConfirm !== cid) {
      // First click - confirm
      setDeleteConfirm(cid);
      return;
    }
    
    // Second click - delete
    setDeleteConfirm(null);
    
    try {
      await storageService.removeFromLocalIndex(cid);
      loadStoredData(); // Refresh the list
    } catch (err) {
      setError('Failed to delete item: ' + err.message);
    }
  };

  const downloadItem = async (item) => {
    try {
      let data;
      
      if (item.details) {
        data = item.details;
      } else {
        const result = await storageService.retrieveDataIPFS(item.cid);
        data = result.data;
      }
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cyberguard-${item.type}-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (err) {
      setError('Failed to download item: ' + err.message);
    }
  };

  const clearAllStoredData = async () => {
    if (window.confirm('Are you sure you want to clear all local storage? This action cannot be undone.')) {
      try {
        storageService.clearLocalStorage();
        loadStoredData();
      } catch (err) {
        setError('Failed to clear storage: ' + err.message);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'scan_result': return <Search className="h-4 w-4 text-blue-400" />;
      case 'chat_history': return <Database className="h-4 w-4 text-purple-400" />;
      case 'incident_report': return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      default: return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'scan_result': return 'URL Scan';
      case 'chat_history': return 'Chat History';
      case 'incident_report': return 'Incident Report';
      default: return 'Other Data';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'scan_result': return 'bg-blue-900 text-blue-300 border-blue-700';
      case 'chat_history': return 'bg-purple-900 text-purple-300 border-purple-700';
      case 'incident_report': return 'bg-orange-900 text-orange-300 border-orange-700';
      default: return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  // Filter and sort data
  const filteredData = storedData.filter(item => {
    // Filter by type
    if (selectedType !== 'all' && item.type !== selectedType) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      // Search in CID and metadata
      return (
        item.cid.toLowerCase().includes(searchLower) ||
        JSON.stringify(item.metadata).toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  }).sort((a, b) => {
    // Sort by timestamp
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    
    return sortOrder === 'newest' 
      ? dateB - dateA 
      : dateA - dateB;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Secure Storage Manager</h1>
        <p className="text-gray-400">
          Manage your decentralized encrypted data stored on IPFS
        </p>
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

      {/* Control Panel */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Stats */}
          <div className="flex items-center space-x-3">
            <Cloud className="h-5 w-5 text-blue-400" />
            <span className="font-medium text-white">
              {stats.totalItems} items stored
            </span>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={loadStoredData}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={clearAllStoredData}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search stored data..."
              className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>
          
          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="scan_result">URL Scans</option>
              <option value="chat_history">Chat History</option>
              <option value="incident_report">Incident Reports</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {/* Sort Order */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="font-medium text-white">Stored Data</h3>
          <span className="text-sm text-gray-400">
            {filteredData.length} items
          </span>
        </div>

        {isLoading && storedData.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mb-4" />
            <p className="text-gray-400">Loading your stored data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Database className="h-8 w-8 text-gray-500 mb-4" />
            <p className="text-gray-400 mb-2">No items found</p>
            <p className="text-sm text-gray-500">
              {searchTerm || selectedType !== 'all' 
                ? 'Try adjusting your search filters' 
                : 'Your secure storage is empty'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {filteredData.map((item, index) => (
              <li key={item.cid} className="p-4">
                <div className="flex flex-col space-y-3">
                  {/* Item Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => toggleExpandItem(item.cid, index)}>
                      {expandedItems[item.cid] ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                      <div className="flex-1">
                        {/* Type badge */}
                        <div className="flex items-center mb-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadgeColor(item.type)}`}>
                            {getTypeIcon(item.type)}
                            <span className="ml-1">{getTypeLabel(item.type)}</span>
                          </span>
                          {item.metadata?.isEncrypted && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
                              <Lock className="h-3 w-3 mr-1" />
                              Encrypted
                            </span>
                          )}
                        </div>
                        
                        {/* Title or CID */}
                        <h4 className="font-medium text-white truncate">
                          {item.metadata?.title || `Data ${item.cid.substring(0, 16)}...`}
                        </h4>
                        
                        {/* Date */}
                        <div className="flex items-center text-sm text-gray-400 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatDate(item.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => downloadItem(item)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full focus:outline-none"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteItem(item.cid)}
                        className={`p-1.5 rounded-full focus:outline-none ${
                          deleteConfirm === item.cid 
                            ? 'text-red-500 bg-red-900 hover:bg-red-800' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                        title={deleteConfirm === item.cid ? 'Confirm delete' : 'Delete'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded details */}
                  {expandedItems[item.cid] && (
                    <div className="mt-2 pl-8">
                      {item.isLoading ? (
                        <div className="flex items-center space-x-2 text-gray-400 py-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Loading details...</span>
                        </div>
                      ) : item.error ? (
                        <div className="bg-red-900/20 border border-red-900/30 rounded p-3 text-red-400 text-sm">
                          Error loading details: {item.error}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Metadata */}
                          <div className="bg-gray-750 rounded p-3">
                            <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                              <Info className="h-4 w-4 mr-1.5" />
                              Metadata
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-400">CID: </span>
                                <span className="text-white break-all">{item.cid}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Created: </span>
                                <span className="text-white">{formatDate(item.timestamp)}</span>
                              </div>
                              {item.metadata && Object.entries(item.metadata).map(([key, value]) => {
                                // Skip complex objects or arrays for simple display
                                if (typeof value !== 'object' && key !== 'type') {
                                  return (
                                    <div key={key}>
                                      <span className="text-gray-400">{key}: </span>
                                      <span className="text-white">{
                                        typeof value === 'boolean' 
                                          ? value ? 'Yes' : 'No'
                                          : value
                                      }</span>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>
                          
                          {/* Content Preview */}
                          {item.details && (
                            <div className="bg-gray-750 rounded p-3">
                              <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                                <File className="h-4 w-4 mr-1.5" />
                                Content Preview
                              </h5>
                              <div className="bg-gray-900 rounded p-3 overflow-auto max-h-80">
                                <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                                  {typeof item.details === 'object' 
                                    ? JSON.stringify(item.details, null, 2) 
                                    : String(item.details)
                                  }
                                </pre>
                              </div>
                            </div>
                          )}
                          
                          {/* Storage Info */}
                          <div className="bg-gray-750 rounded p-3">
                            <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                              <Shield className="h-4 w-4 mr-1.5" />
                              Storage Details
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-400">Storage Type: </span>
                                <span className="text-white">
                                  {item.metadata?.storageMethod || 'Local IPFS'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Encryption: </span>
                                <span className="text-white">
                                  {item.metadata?.isEncrypted ? 'AES-256' : 'None'}
                                </span>
                              </div>
                              {item.metadata?.gateway && (
                                <div className="col-span-2">
                                  <span className="text-gray-400">Gateway: </span>
                                  <a 
                                    href={`${item.metadata.gateway}/ipfs/${item.cid}`} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 inline-flex items-center"
                                  >
                                    {item.metadata.gateway}
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Storage Info Card */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <Cloud className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">About Secure Storage</h3>
        </div>
        <div className="space-y-4 text-gray-300">
          <p>
            CyberGuard uses decentralized storage through IPFS (InterPlanetary File System) to securely store your data.
            All sensitive information is encrypted before being stored, and you maintain full control of your encryption keys.
          </p>
          <div>
            <h4 className="font-medium text-white mb-2">Storage Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>End-to-end encryption using AES-256</li>
              <li>Decentralized storage on IPFS network</li>
              <li>No single point of failure</li>
              <li>Data persistence across multiple nodes</li>
              <li>Content addressing ensures data integrity</li>
              <li>Optional local-only storage mode for maximum privacy</li>
            </ul>
          </div>
          <div className="text-sm text-gray-400 border-t border-gray-700 pt-4 mt-4">
            <p>
              Note: Data stored in the browser is also backed up locally in your browser's IndexedDB storage.
              If you clear your browser data, you may lose access to encryption keys.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageManager;