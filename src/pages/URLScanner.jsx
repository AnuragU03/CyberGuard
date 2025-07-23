// src/pages/URLScanner.jsx
import React, { useState } from 'react';
import { useApiMutation } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { Scan, Shield, ShieldCheck, ShieldX, ExternalLink } from 'lucide-react';

const URLScanner = () => {
  const { currentUser } = useAuth();
  const [url, setUrl] = useState('');
  const [scanResults, setScanResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const scanMutation = useApiMutation(async (data) => {
    // Replace with your actual API call logic, e.g. using fetch or axios
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  });

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await scanMutation.mutateAsync({
        url: url.trim(),
        userId: currentUser.id,
        deepScan: true
      });
      if (response.success) {
        setScanResults(response.data);
      } else {
        setError(response.message || 'Scan failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during scanning');
      console.error('URL scan error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRiskLevel = (riskScore) => {
    if (riskScore >= 80) {
      return (
        <div className="flex items-center text-red-400">
          <ShieldX className="h-5 w-5 mr-2" />
          <span>High Risk ({riskScore}%)</span>
        </div>
      );
    } else if (riskScore >= 40) {
      return (
        <div className="flex items-center text-yellow-400">
          <Shield className="h-5 w-5 mr-2" />
          <span>Medium Risk ({riskScore}%)</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-green-400">
          <ShieldCheck className="h-5 w-5 mr-2" />
          <span>Low Risk ({riskScore}%)</span>
        </div>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">URL Security Scanner</h2>
          <p className="mt-1 text-gray-400">
            Scan any URL for malicious content, phishing attempts, and security vulnerabilities
          </p>
        </div>

        <div className="px-6 py-6">
          <form onSubmit={handleScan} className="mb-8">
            <div className="flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Scan className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 rounded-l-md"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Scanning...
                  </>
                ) : (
                  'Scan URL'
                )}
              </button>
            </div>
            {error && (
              <div className="mt-2 text-red-400 text-sm">{error}</div>
            )}
          </form>

          {scanResults && (
            <div className="bg-gray-750 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-white">Scan Results</h3>
                  <div className="mt-1">
                    {renderRiskLevel(scanResults.riskScore)}
                  </div>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-400 hover:text-blue-300"
                >
                  Visit site <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-300 mb-3">Security Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Domain Reputation</span>
                      <span className={scanResults.domainReputation === 'safe' ? 'text-green-400' : 'text-red-400'}>
                        {scanResults.domainReputation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">SSL Certificate</span>
                      <span className={scanResults.sslValid ? 'text-green-400' : 'text-red-400'}>
                        {scanResults.sslValid ? 'Valid' : 'Invalid'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Malware Detected</span>
                      <span className={scanResults.malwareDetected ? 'text-red-400' : 'text-green-400'}>
                        {scanResults.malwareDetected ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phishing Risk</span>
                      <span className={scanResults.phishingRisk ? 'text-red-400' : 'text-green-400'}>
                        {scanResults.phishingRisk ? 'High' : 'Low'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-300 mb-3">Threat Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Suspicious Content</span>
                      <span className={scanResults.suspiciousContent ? 'text-red-400' : 'text-green-400'}>
                        {scanResults.suspiciousContent ? 'Detected' : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Known Threats</span>
                      <span className={scanResults.knownThreats.length > 0 ? 'text-red-400' : 'text-green-400'}>
                        {scanResults.knownThreats.length > 0 ? scanResults.knownThreats.length : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vulnerabilities</span>
                      <span className={scanResults.vulnerabilities.length > 0 ? 'text-red-400' : 'text-green-400'}>
                        {scanResults.vulnerabilities.length > 0 ? scanResults.vulnerabilities.length : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Safe Browsing</span>
                      <span className={scanResults.safeBrowsing ? 'text-green-400' : 'text-red-400'}>
                        {scanResults.safeBrowsing ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-300 mb-3">Recommendations</h4>
                <div className="bg-gray-700 rounded-lg p-4">
                  <ul className="list-disc pl-5 space-y-2 text-gray-300">
                    {scanResults.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                  Save Report
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-200 bg-gray-700 hover:bg-gray-600">
                  Rescan
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 bg-gray-750 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Scan History</h3>
            <div className="text-center py-8">
              <p className="text-gray-400">No scan history available</p>
              <p className="text-gray-500 text-sm mt-2">Your scanned URLs will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default URLScanner;
