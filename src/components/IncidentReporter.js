import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Link, 
  Mail, 
  RefreshCw, 
  Send, 
  Upload 
} from 'lucide-react';
import storageService from '../services/storageService';
import { toast } from 'react-hot-toast';

const IncidentReporter = () => {
  const [formData, setFormData] = useState({
    incidentType: '',
    incidentTitle: '',
    description: '',
    affectedSystems: '',
    dateDetected: '',
    url: '',
    email: '',
    attachFiles: null,
    additionalInfo: ''
  });
  
  const [advancedMode, setAdvancedMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'attachFiles' && files) {
      setFormData(prev => ({
        ...prev,
        [name]: files
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare report data
      const reportData = {
        ...formData,
        reportedAt: new Date().toISOString(),
        // Convert file list to base64 if there are attachments
        attachments: formData.attachFiles ? await Promise.all(
          Array.from(formData.attachFiles).map(async (file) => {
            return {
              name: file.name,
              type: file.type,
              size: file.size,
              data: await fileToBase64(file)
            };
          })
        ) : []
      };
      
      // Store the incident report
      const result = await storageService.storeDataIPFS(reportData, {
        type: 'incident_report',
        title: formData.incidentTitle || 'Incident Report',
        isEncrypted: true
      });
      
      if (result.success) {
        setSubmitSuccess(true);
        toast.success('Incident report submitted successfully');
        
        // Reset form
        setFormData({
          incidentType: '',
          incidentTitle: '',
          description: '',
          affectedSystems: '',
          dateDetected: '',
          url: '',
          email: '',
          attachFiles: null,
          additionalInfo: ''
        });
      } else {
        throw new Error(result.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting incident report:', error);
      toast.error(`Failed to submit report: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Incident Reporter</h1>
        <p className="text-gray-400">
          Report cybersecurity incidents, suspicious activities, or potential threats
        </p>
      </div>

      {submitSuccess ? (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-green-900/50 p-3">
              <AlertTriangle className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Report Submitted Successfully</h3>
            <p className="text-gray-300 max-w-md">
              Thank you for your report. Our security team will review the information provided.
            </p>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6">
              {/* Incident Type */}
              <div className="mb-6">
                <label htmlFor="incidentType" className="block text-sm font-medium text-gray-300 mb-1">
                  Incident Type*
                </label>
                <select
                  id="incidentType"
                  name="incidentType"
                  value={formData.incidentType}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>Select incident type</option>
                  <option value="phishing">Phishing Attempt</option>
                  <option value="malware">Malware or Virus</option>
                  <option value="unauthorized_access">Unauthorized Access</option>
                  <option value="data_breach">Data Breach</option>
                  <option value="social_engineering">Social Engineering</option>
                  <option value="suspicious_activity">Suspicious Activity</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Incident Title */}
              <div className="mb-6">
                <label htmlFor="incidentTitle" className="block text-sm font-medium text-gray-300 mb-1">
                  Incident Title*
                </label>
                <input
                  type="text"
                  id="incidentTitle"
                  name="incidentTitle"
                  value={formData.incidentTitle}
                  onChange={handleChange}
                  placeholder="Brief title describing the incident"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the incident in detail"
                  rows={5}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Additional Details */}
              <div className="flex items-center space-x-2 mb-2">
                <button
                  type="button"
                  onClick={() => setAdvancedMode(!advancedMode)}
                  className="text-blue-400 hover:text-blue-300 focus:outline-none text-sm flex items-center"
                >
                  {advancedMode ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                  {advancedMode ? 'Show less fields' : 'Show more fields'}
                </button>
              </div>

              {advancedMode && (
                <div className="space-y-6 pt-2 border-t border-gray-700">
                  {/* Affected Systems */}
                  <div>
                    <label htmlFor="affectedSystems" className="block text-sm font-medium text-gray-300 mb-1">
                      Affected Systems
                    </label>
                    <input
                      type="text"
                      id="affectedSystems"
                      name="affectedSystems"
                      value={formData.affectedSystems}
                      onChange={handleChange}
                      placeholder="E.g., Personal laptop, Home network, Mobile device"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Date Detected */}
                  <div>
                    <label htmlFor="dateDetected" className="block text-sm font-medium text-gray-300 mb-1">
                      Date Incident Detected
                    </label>
                    <input
                      type="datetime-local"
                      id="dateDetected"
                      name="dateDetected"
                      value={formData.dateDetected}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* URL */}
                  <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">
                      Related URL
                    </label>
                    <div className="flex space-x-3">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Link className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="url"
                          id="url"
                          name="url"
                          value={formData.url}
                          onChange={handleChange}
                          placeholder="https://example.com"
                          className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">URL of the suspicious website, email, or content</p>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Contact Email
                    </label>
                    <div className="flex space-x-3">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">Optional: for follow-up communications</p>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label htmlFor="attachFiles" className="block text-sm font-medium text-gray-300 mb-1">
                      Attach Evidence Files
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-600 rounded-lg">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-400">
                          <label
                            htmlFor="attachFiles"
                            className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none"
                          >
                            <span>Upload files</span>
                            <input
                              id="attachFiles"
                              name="attachFiles"
                              type="file"
                              className="sr-only"
                              multiple
                              onChange={handleChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-400">
                          Screenshots, suspicious files, or other evidence (max 10MB)
                        </p>
                      </div>
                    </div>
                    {formData.attachFiles && formData.attachFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-300">Selected files:</p>
                        <ul className="list-disc list-inside text-sm text-gray-400 ml-2">
                          {Array.from(formData.attachFiles).map((file, index) => (
                            <li key={index}>{file.name} ({Math.round(file.size / 1024)} KB)</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div>
                    <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-300 mb-1">
                      Additional Information
                    </label>
                    <textarea
                      id="additionalInfo"
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleChange}
                      placeholder="Any other details you think might be relevant"
                      rows={3}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                Submitting Report...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Submit Incident Report
              </>
            )}
          </button>
        </form>
      )}
      
      {/* Help Box */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <HelpCircle className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Reporting Guidelines</h3>
        </div>
        <div className="space-y-4 text-gray-300">
          <p>
            Use this form to report any cybersecurity incidents, suspicious activities, or potential threats you've encountered.
          </p>
          <div>
            <h4 className="font-medium text-white mb-2">What to report:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Phishing emails or suspicious messages</li>
              <li>Suspected malware infections</li>
              <li>Unauthorized access to accounts</li>
              <li>Data breaches or exposure</li>
              <li>Social engineering attempts</li>
              <li>Suspicious network activity</li>
            </ul>
          </div>
          <p className="text-sm text-gray-400">
            Your reports help us identify and respond to emerging threats in the cybersecurity landscape.
            All submissions are encrypted and stored securely.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IncidentReporter;