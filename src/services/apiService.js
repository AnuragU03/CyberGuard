// src/services/apiService.js
import axios from 'axios';
import config from '../config';

class APIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor - simplified to skip authentication
    this.client.interceptors.request.use(
      (config) => {
        // Always use a mock token
        config.headers.Authorization = `Bearer mock-token-for-demo`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // VirusTotal API Integration
  async scanUrlVirusTotal(url) {
    try {
      const response = await this.client.post('/api/scan/virustotal', {
        url,
        apikey: process.env.REACT_APP_VIRUSTOTAL_API_KEY
      });
      return response.data;
    } catch (error) {
      throw new Error(`VirusTotal scan failed: ${error.message}`);
    }
  }

  // AbuseIPDB API Integration
  async checkUrlAbuseIPDB(url) {
    try {
      const response = await this.client.post('/api/scan/abuseipdb', {
        url,
        apikey: process.env.REACT_APP_ABUSEIPDB_API_KEY
      });
      return response.data;
    } catch (error) {
      throw new Error(`AbuseIPDB check failed: ${error.message}`);
    }
  }

  // PhishTank API Integration
  async checkPhishTank(url) {
    try {
      const response = await this.client.post('/api/scan/phishtank', {
        url,
        apikey: process.env.REACT_APP_PHISHTANK_API_KEY
      });
      return response.data;
    } catch (error) {
      throw new Error(`PhishTank check failed: ${error.message}`);
    }
  }

  // Google Safe Browsing API
  async checkGoogleSafeBrowsing(url) {
    try {
      const response = await this.client.post('/api/scan/google-safe-browsing', {
        url,
        apikey: process.env.REACT_APP_GOOGLE_SAFE_BROWSING_API_KEY
      });
      return response.data;
    } catch (error) {
      throw new Error(`Google Safe Browsing check failed: ${error.message}`);
    }
  }

  // LeakCheck API Integration
  async checkEmailLeaks(email) {
    try {
      const response = await this.client.post('/api/leak-check', {
        email,
        apikey: process.env.REACT_APP_LEAKCHECK_API_KEY
      });
      return response.data;
    } catch (error) {
      throw new Error(`Leak check failed: ${error.message}`);
    }
  }

  // Comprehensive URL Analysis
  async analyzeUrl(url) {
    try {
      const [virusTotal, abuseIPDB, phishTank, safeBrowsing, urlScan] = await Promise.allSettled([
        this.scanUrlVirusTotal(url),
        this.checkUrlAbuseIPDB(url),
        this.checkPhishTank(url),
        this.checkGoogleSafeBrowsing(url),
        this.scanUrlWithUrlScan(url)
      ]);

      return {
        url,
        timestamp: new Date().toISOString(),
        results: {
          virusTotal: virusTotal.status === 'fulfilled' ? virusTotal.value : null,
          abuseIPDB: abuseIPDB.status === 'fulfilled' ? abuseIPDB.value : null,
          phishTank: phishTank.status === 'fulfilled' ? phishTank.value : null,
          safeBrowsing: safeBrowsing.status === 'fulfilled' ? safeBrowsing.value : null,
          urlScan: urlScan.status === 'fulfilled' ? urlScan.value : null
        },
        errors: [
          virusTotal.status === 'rejected' ? virusTotal.reason : null,
          abuseIPDB.status === 'rejected' ? abuseIPDB.reason : null,
          phishTank.status === 'rejected' ? phishTank.reason : null,
          safeBrowsing.status === 'rejected' ? safeBrowsing.reason : null,
          urlScan.status === 'rejected' ? urlScan.reason : null
        ].filter(Boolean)
      };
    } catch (error) {
      throw new Error(`URL analysis failed: ${error.message}`);
    }
  }

  // AI Chat Integration with Claude API support
  async chatWithAI(message, history = []) {
    // DEBUGGING
    console.log("ChatWithAI called with message:", message);
    console.log("Local mode from localStorage:", localStorage.getItem('useLocalMode'));
    console.log("isLocalMode value:", localStorage.getItem('useLocalMode') === 'true');
    console.log("Claude API Key available:", !!process.env.REACT_APP_CLAUDE_API_KEY);
    console.log("Claude API Key from session:", !!sessionStorage.getItem('CLAUDE_API_KEY'));
    
    // Check if we should use local mode
    const useLocalMode = localStorage.getItem('useLocalMode') === 'true';
    
    if (useLocalMode) {
      console.log("Using local AI mode (by user preference)");
      return this.getLocalAIResponse(message, history);
    }
    
    try {
      // Get Claude API key
      const claudeApiKey = 
        process.env.REACT_APP_CLAUDE_API_KEY || 
        sessionStorage.getItem('CLAUDE_API_KEY');
      
      console.log("API key found:", !!claudeApiKey);
      
      if (!claudeApiKey) {
        console.warn("No Claude API key found, falling back to local mode");
        return this.getLocalAIResponse(message, history);
      }
      
      // Log the API call attempt
      console.log("Attempting Claude API call with key:", claudeApiKey.substring(0, 10) + "...");
      
      // Format conversation history for Claude
      let claudeMessages = [];
      
      // Add system message if first message
      if (!history || history.length === 0) {
        claudeMessages.push({
          role: "user",
          content: "You are CyberGuard AI, a cybersecurity assistant. Please provide helpful, accurate information about cybersecurity topics, threats, and best practices. Respond to the following: " + message
        });
      } else {
        // Process conversation history
        history.forEach(msg => {
          // Map roles to Claude format (Claude only supports 'user' and 'assistant')
          const role = msg.role === 'system' ? 'user' : msg.role;
          claudeMessages.push({
            role: role,
            content: msg.content
          });
        });
        
        // Add the current message
        claudeMessages.push({ 
          role: "user", 
          content: message 
        });
      }
      
      // Get Claude model from env vars or use default
      const claudeModel = process.env.REACT_APP_CLAUDE_MODEL || 'claude-3-sonnet-20240229';
      
      console.log("Using Claude model:", claudeModel);
      console.log("Request payload:", JSON.stringify({
        model: claudeModel,
        messages: claudeMessages,
        max_tokens: 1000,
        temperature: 0.7
      }));
      

      // Make call to Claude API through our proxy server
      const claudeResponse = await fetch('http://localhost:5000/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey
        },
        body: JSON.stringify({
          model: claudeModel,
          messages: claudeMessages,
          max_tokens: 1000,
          temperature: 0.7
        })
      });
      
      console.log("Claude API response status:", claudeResponse.status);
      
      // Log the entire response for debugging
      const responseText = await claudeResponse.text();
      console.log("Raw response:", responseText);
      
      if (!claudeResponse.ok) {
        throw new Error(`Claude API error: ${responseText}`);
      }
      
      // Parse the response
      const data = JSON.parse(responseText);
      return {
        message: data.content && data.content[0] && data.content[0].text 
          ? data.content[0].text 
          : "Sorry, I couldn't generate a response at this time.",
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error("Error using Claude API:", error);
      console.log("Falling back to local mode due to API error");
      return this.getLocalAIResponse(message, history);
    }
  }

  // Helper method for local AI responses
  getLocalAIResponse(message, history = []) {
    return new Promise(resolve => {
      // Simulate network delay
      setTimeout(() => {
        resolve({
          message: this.generateLocalAIResponse(message, history),
          timestamp: new Date().toISOString()
        });
      }, 500 + Math.random() * 1000);
    });
  }

  // Generate responses locally based on keywords
  generateLocalAIResponse(message, history = []) {
    const lowercaseMsg = message.toLowerCase();
    
    // Cybersecurity specific responses
    if (lowercaseMsg.includes('password') || lowercaseMsg.includes('passwords')) {
      return "Strong passwords are essential for security. Here are best practices:\n\n• Use at least 12 characters\n• Mix uppercase, lowercase, numbers, and symbols\n• Avoid personal information\n• Use different passwords for different accounts\n• Consider using a password manager like Bitwarden or KeePass\n• Enable 2FA wherever possible";
    }
    
    if (lowercaseMsg.includes('phishing') || lowercaseMsg.includes('scam email')) {
      return "Phishing is a major security threat. Look for these warning signs:\n\n• Unexpected emails requesting urgent action\n• Suspicious links or attachments\n• Requests for personal/financial information\n• Poor grammar or spelling\n• Mismatched or suspicious URLs\n• Generic greetings instead of your name\n\nAlways verify the sender before taking action, and never click suspicious links.";
    }
    
    if (lowercaseMsg.includes('vpn') || lowercaseMsg.includes('virtual private network')) {
      return "VPNs (Virtual Private Networks) enhance your online privacy by:\n\n• Encrypting your internet traffic\n• Masking your IP address and location\n• Protecting your data on public Wi-Fi\n• Bypassing geographic restrictions\n\nRecommended secure VPN providers include ProtonVPN, Mullvad, and WireGuard-based solutions. Avoid free VPNs as they often collect and sell your data.";
    }
    
    if (lowercaseMsg.includes('malware') || lowercaseMsg.includes('virus')) {
      return "To protect against malware:\n\n• Keep your operating system and software updated\n• Use reputable antivirus/anti-malware software\n• Enable automatic updates\n• Be cautious about downloads and attachments\n• Verify file sources before downloading\n• Use an ad-blocker and script-blocker\n• Regularly back up your important data\n• Consider using application whitelisting";
    }
    
    if (lowercaseMsg.includes('two-factor') || lowercaseMsg.includes('2fa') || lowercaseMsg.includes('mfa')) {
      return "Two-factor authentication (2FA) significantly improves security by requiring:\n\n1. Something you know (password)\n2. Something you have (device) or something you are (biometrics)\n\nPreferred 2FA methods (from most to least secure):\n• Hardware keys (YubiKey, Titan)\n• Authentication apps (Aegis, Authy)\n• Push notifications\n• SMS (least secure)\n\nEnable 2FA on all important accounts, especially email, banking, and cloud storage.";
    }
    
    if (lowercaseMsg.includes('firewall') || lowercaseMsg.includes('network security')) {
      return "Firewalls are crucial for network security:\n\n• They monitor and filter incoming/outgoing traffic\n• Block unauthorized access attempts\n• Can prevent malware communication\n\nRecommendations:\n• Enable your OS built-in firewall\n• Consider a hardware firewall for home networks\n• Use application-based firewall controls\n• Regularly review and update firewall rules\n• Implement egress filtering to control outbound traffic";
    }
    
    if (lowercaseMsg.includes('encryption') || lowercaseMsg.includes('encrypt')) {
      return "Encryption protects your data by converting it into coded text:\n\n• Use HTTPS websites (look for the lock icon)\n• Encrypt your devices with FileVault (Mac) or BitLocker (Windows)\n• Use encrypted messaging apps like Signal\n• Consider encrypted email with ProtonMail or Tutanota\n• Use encrypted cloud storage or encrypt files before uploading\n\nEnd-to-end encryption ensures only you and your recipient can read messages.";
    }
    
    if (lowercaseMsg.includes('backup') || lowercaseMsg.includes('data loss')) {
      return "Follow the 3-2-1 backup strategy:\n\n• 3 copies of your data\n• 2 different storage types\n• 1 copy off-site\n\nBackup options:\n• External hard drives\n• NAS (Network Attached Storage)\n• Cloud backup services\n• Specialized backup software\n\nTest your backups regularly to ensure you can restore from them when needed.";
    }
    
    if (lowercaseMsg.includes('update') || lowercaseMsg.includes('patch')) {
      return "Keeping software updated is critical for security:\n\n• Enable automatic updates when possible\n• Regularly check for updates manually\n• Update your operating system, browsers, and apps\n• Don't ignore update notifications\n• Consider using update management software\n• Be especially prompt with security patches\n\nMany breaches exploit known vulnerabilities that patches have already fixed.";
    }
    
    if (lowercaseMsg.includes('social engineering')) {
      return "Social engineering attacks manipulate people into breaking security procedures. Protection strategies:\n\n• Verify requests through different channels\n• Be skeptical of urgent requests\n• Don't provide sensitive information without verification\n• Follow security policies even when inconvenient\n• Report suspicious contacts\n• Remember that legitimate organizations won't ask for passwords\n• Be cautious with unexpected calls, texts, or visitors";
    }
    
    if (lowercaseMsg.includes('browser') || lowercaseMsg.includes('safe browsing')) {
      return "For safer browsing:\n\n• Use a privacy-focused browser like Firefox or Brave\n• Install extensions like uBlock Origin and Privacy Badger\n• Keep browsers updated\n• Clear cookies and cache regularly\n• Use private/incognito mode for sensitive browsing\n• Consider using a separate browser for financial transactions\n• Manually check URLs before entering credentials";
    }
    
    if (lowercaseMsg.includes('wifi') || lowercaseMsg.includes('wireless')) {
      return "Secure your Wi-Fi network by:\n\n• Using WPA3 encryption (or at minimum WPA2)\n• Creating a strong, unique password\n• Changing the default SSID name\n• Enabling the router firewall\n• Keeping router firmware updated\n• Creating a guest network for visitors\n• Disabling WPS (Wi-Fi Protected Setup)\n• Using a VPN on public Wi-Fi";
    }
    
    if (lowercaseMsg.includes('iot') || lowercaseMsg.includes('smart home') || lowercaseMsg.includes('smart device')) {
      return "IoT device security best practices:\n\n• Change default passwords immediately\n• Update firmware regularly\n• Create a separate network for IoT devices\n• Disable features you don't use\n• Research security before purchasing\n• Disable remote access when not needed\n• Consider privacy implications\n• Unplug devices not in regular use";
    }
    
    // Greetings and general questions
    if (lowercaseMsg.includes('hello') || lowercaseMsg.includes('hi ') || lowercaseMsg === 'hi') {
      return "Hello! I'm your CyberGuard AI Assistant. I can help with cybersecurity questions and provide guidance on best practices. What would you like to know about today?";
    }
    
    if (lowercaseMsg.includes('how are you')) {
      return "I'm functioning well and ready to assist with your cybersecurity questions. How can I help you stay safer online today?";
    }
    
    if (lowercaseMsg.includes('thank you') || lowercaseMsg.includes('thanks')) {
      return "You're welcome! If you have any other cybersecurity questions, feel free to ask. Staying informed is a key part of staying secure.";
    }
    
    if (lowercaseMsg.includes('who are you') || lowercaseMsg.includes('what are you')) {
      return "I'm the CyberGuard AI Assistant, designed to provide cybersecurity guidance and best practices. I can help with questions about online safety, security tools, threat protection, and more.";
    }
    
    if (lowercaseMsg.includes('help') || lowercaseMsg.includes('can you help')) {
      return "I can help with many cybersecurity topics including:\n• Password security\n• Phishing protection\n• Malware prevention\n• Two-factor authentication\n• VPNs and encryption\n• Data backups\n• Safe browsing practices\n• Network security\n\nWhat specific area would you like assistance with?";
    }
    
    // Response for questions about home network security
    if (lowercaseMsg.includes('home network') || (lowercaseMsg.includes('protect') && lowercaseMsg.includes('network'))) {
      return "To protect your home network:\n\n• Use a strong, unique router password\n• Enable WPA3 encryption if available (WPA2 at minimum)\n• Change the default network name (SSID)\n• Keep router firmware updated\n• Enable the router's firewall\n• Use a guest network for visitors and IoT devices\n• Consider a hardware firewall for added protection\n• Use DNS filtering (like Pi-hole or NextDNS)\n• Regularly audit connected devices\n• Position your router in a central location";
    }
    
    // Response for security after a breach
    if ((lowercaseMsg.includes('after') && lowercaseMsg.includes('breach')) || (lowercaseMsg.includes('what') && lowercaseMsg.includes('do') && lowercaseMsg.includes('breach'))) {
      return "Steps to take after a data breach:\n\n1. Change passwords for affected accounts immediately\n2. Enable two-factor authentication wherever possible\n3. Monitor your accounts for suspicious activity\n4. Check haveibeenpwned.com to see if your data appears in other breaches\n5. Consider freezing your credit if financial information was exposed\n6. Be alert for phishing attempts that may use your exposed data\n7. Update and scan your devices for malware\n8. Consider using a password manager going forward\n9. Set up fraud alerts with credit bureaus\n10. Report identity theft to appropriate authorities if it occurs";
    }
    
    // Default response for anything else
    return "That's an interesting cybersecurity question. While I'm operating in local mode without external AI services, I can provide information on common topics like:\n\n• Password security\n• Phishing prevention\n• Malware protection\n• Two-factor authentication\n• VPN usage\n• Encryption\n• Data backups\n• Software updates\n• Social engineering\n\nCould you rephrase your question to focus on one of these areas?";
  }
  // User Management
  async registerUser(userData) {
    try {
      const response = await this.client.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async loginUser(credentials) {
    try {
      const response = await this.client.post('/api/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async logoutUser() {
    localStorage.removeItem('auth_token');
    return { success: true };
  }

  // Scan History
  async getScanHistory(limit = 20) {
    try {
      const response = await this.client.get(`/api/history/scans?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch scan history: ${error.message}`);
    }
  }

  async saveScanResult(scanData) {
    try {
      const response = await this.client.post('/api/history/scans', scanData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to save scan result: ${error.message}`);
    }
  }

  // Incident Reporting
  async reportIncident(incidentData) {
    try {
      const response = await this.client.post('/api/incidents/report', incidentData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to report incident: ${error.message}`);
    }
  }

  // Background Monitoring
  async startBackgroundMonitoring(options) {
    try {
      const response = await this.client.post('/api/monitoring/start', options);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to start monitoring: ${error.message}`);
    }
  }

  async stopBackgroundMonitoring() {
    try {
      const response = await this.client.post('/api/monitoring/stop');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to stop monitoring: ${error.message}`);
    }
  }

  // URLScan.io API Integration
  async scanUrlWithUrlScan(url) {
    try {
      // First, submit the URL for scanning
      const submitResponse = await fetch('https://urlscan.io/api/v1/scan/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-Key': '0197251c-d670-774a-ba58-f984605398a6'
        },
        body: JSON.stringify({
          url: url,
          visibility: 'public'
        })
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.text();
        console.error('URLScan submission error:', errorData);
        throw new Error(`URLScan submission failed: ${submitResponse.status}`);
      }

      const submitData = await submitResponse.json();
      console.log('URLScan submission successful:', submitData);
      
      // The API returns a UUID that we can use to fetch results
      const scanUuid = submitData.uuid;
      const resultUrl = submitData.api;
      
      // URLScan.io takes time to scan the URL, so we need to poll for results
      // Wait a bit before checking for results (URLScan typically takes 10-60 seconds)
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      // Now try to fetch the results
      let resultData = null;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (!resultData && attempts < maxAttempts) {
        try {
          console.log(`Attempt ${attempts + 1} to fetch URLScan results...`);
          const resultResponse = await fetch(resultUrl, {
            method: 'GET',
            headers: {
              'API-Key': '0197251c-d670-774a-ba58-f984605398a6'
            }
          });
          
          if (resultResponse.ok) {
            resultData = await resultResponse.json();
            console.log('URLScan results retrieved successfully');
          } else if (resultResponse.status === 404) {
            // Scan not complete yet, wait and retry
            console.log('URLScan results not ready yet, waiting...');
            await new Promise(resolve => setTimeout(resolve, 5000 * (attempts + 1)));
          } else {
            throw new Error(`Failed to get URLScan results: ${resultResponse.status}`);
          }
        } catch (error) {
          console.warn('Error fetching URLScan results, retrying...', error);
        }
        
        attempts++;
      }
      
      if (!resultData) {
        throw new Error('URLScan results not available after multiple attempts');
      }
      
      // Format the results for our application
      return {
        uuid: scanUuid,
        url: url,
        screenshot: resultData.task && resultData.task.screenshotURL,
        verdict: {
          overall: resultData.verdicts?.overall?.score || 0,
          malicious: resultData.verdicts?.overall?.malicious || false,
          categories: resultData.verdicts?.overall?.categories || []
        },
        page: {
          ip: resultData.page?.ip || '',
          country: resultData.page?.country || '',
          server: resultData.page?.server || '',
          domain: resultData.page?.domain || '',
          url: resultData.page?.url || ''
        },
        malicious: resultData.verdicts?.overall?.malicious || false,
        reportUrl: `https://urlscan.io/result/${scanUuid}/`,
        brands: resultData.brands || [],
        // Extract security-relevant data from the result
        securityDetails: {
          certificates: resultData.page?.tlsData?.certificates || [],
          securityState: resultData.page?.securityState || 'unknown',
          protocols: resultData.page?.tlsData?.protocols || []
        }
      };
    } catch (error) {
      console.error('URLScan error:', error);
      throw new Error(`URLScan analysis failed: ${error.message}`);
    }
  }
}

export default new APIService();
