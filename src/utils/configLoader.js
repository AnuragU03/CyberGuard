import config from '../config';

// Initialize configuration
export function initConfig() {
  // Make config globally available
  window.config = config;
  
  console.log("Environment:", config.environment);
  console.log("Claude API Key available:", !!config.claudeApiKey);
  
  // Check for environment variables
  if (!config.claudeApiKey) {
    console.warn("No Claude API key found in config or environment variables");
  }
  
  return config;
}

// Export singleton
export default config;