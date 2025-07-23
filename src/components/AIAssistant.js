import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Trash2, 
  Copy, 
  AlertTriangle, 
  RefreshCw,
  Save,
  Link,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import apiService from '../services/apiService';
import mcpService from '../services/mcpService';
import storageService from '../services/storageService';

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [chatSaved, setChatSaved] = useState(false);
  
  // Update your isLocalMode state to read from localStorage
  const [isLocalMode, setIsLocalMode] = useState(
    localStorage.getItem('useLocalMode') === 'true'
  );

  // Toggle between modes
  const toggleLocalMode = () => {
    const newMode = !isLocalMode;
    console.log("Switching to mode:", newMode ? "local" : "API");
    setIsLocalMode(newMode);
    localStorage.setItem('useLocalMode', newMode.toString());
  };

  // Example suggested prompts
  const suggestedPrompts = [
    "How can I protect my home network?",
    "Explain what phishing is and how to avoid it",
    "What security steps should I take after a data breach?",
    "How do I create a strong password policy?",
    "What is two-factor authentication and why is it important?"
  ];

  useEffect(() => {
    // Scroll to bottom of messages
    scrollToBottom();
    
    // Add welcome message if no messages
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: "Hello! I'm your CyberGuard AI Assistant running in local mode. I can help with common cybersecurity questions. How can I assist you today?",
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // In AIAssistant.js, add a console log in handleSubmit to help debug:

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setChatSaved(false);
    
    try {
      // Format messages for AI API
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      console.log("Calling chatWithAI in local mode");
      // Use local mode implementation
      const response = await apiService.chatWithAI(userMessage.content, messageHistory);
      console.log("Got response from local mode:", response);
      
      const assistantMessage = {
        role: 'assistant',
        content: response.message || "I'm sorry, I couldn't process your request.",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (err) {
      console.error('AI chat error:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt);
  };

  const clearConversation = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm your CyberGuard AI Assistant running in local mode. I can help with common cybersecurity questions. How can I assist you today?",
        timestamp: new Date().toISOString()
      }
    ]);
    setChatSaved(false);
  };

  const copyConversation = () => {
    const conversationText = messages
      .map(msg => `${msg.role === 'assistant' ? 'AI: ' : 'You: '} ${msg.content}`)
      .join('\n\n');
    navigator.clipboard.writeText(conversationText);
    // You could add a toast notification here
  };

  const saveConversation = async () => {
    try {
      await storageService.storeChatHistory(messages);
      setChatSaved(true);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to save conversation:', error);
      setError('Failed to save conversation');
    }
  };

  const formatMessage = (content) => {
    // Handle markdown-like content
    // This is a simple implementation - consider a proper markdown parser for production
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const boldRegex = /\*\*(.*?)\*\*/g;
    const listRegex = /^- (.*)/gm;
    
    let formatted = content
      .replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>')
      .replace(boldRegex, '<strong>$1</strong>')
      .replace(listRegex, '<li>$1</li>');
    
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/<li>/g, '<li class="ml-4">');
    }
    
    return { __html: formatted };
  };

  // Inside your AIAssistant component, add a testApiConnection function:

  const testApiConnection = () => {
    const testMsg = "This is a test message to verify Claude API connectivity";
    console.log("Testing API with message:", testMsg);
    setIsLoading(true);
    
    // Force API mode for this test
    const originalMode = localStorage.getItem('useLocalMode');
    localStorage.setItem('useLocalMode', 'false');
    
    apiService.chatWithAI(testMsg, [])
      .then(response => {
        console.log("API test response:", response);
        setError(`API test result: ${response.message.substring(0, 50)}...`);
        // Restore original mode
        localStorage.setItem('useLocalMode', originalMode);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("API test error:", err);
        setError(`API test error: ${err.message}`);
        // Restore original mode
        localStorage.setItem('useLocalMode', originalMode);
        setIsLoading(false);
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">AI Cybersecurity Assistant</h1>
        <p className="text-gray-400">Ask questions about cybersecurity or get personalized advice</p>
      </div>

      {/* Chat Container */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 flex flex-col h-[600px]">
        {/* Local Mode Indicator */}
        <div className="flex items-center justify-between mb-4 p-2 bg-blue-900/30 rounded-md mx-4 mt-4">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-blue-400"></div>
            <span className="text-xs text-blue-300">
              {isLocalMode 
                ? 'Running in local mode - no API key required' 
                : 'Using Claude AI API'}
            </span>
          </div>
          <button 
            onClick={toggleLocalMode}
            className="text-xs text-blue-300 hover:text-blue-100 underline"
          >
            Switch to {isLocalMode ? 'API' : 'local'} mode
          </button>
        </div>
        
        {/* Chat Controls */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-400" />
            <span className="font-medium text-white">CyberGuard Assistant</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={copyConversation}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 focus:outline-none"
              title="Copy conversation"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={saveConversation}
              className={`p-2 rounded-full focus:outline-none ${
                chatSaved 
                  ? 'text-green-400 hover:text-green-300 hover:bg-green-900/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title={chatSaved ? "Conversation saved" : "Save conversation"}
            >
              <Save className="h-4 w-4" />
            </button>
            <button
              onClick={clearConversation}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 focus:outline-none"
              title="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={testApiConnection}
              className="p-2 text-yellow-400 hover:text-yellow-300 rounded-full hover:bg-gray-700 focus:outline-none"
              title="Test API Connection"
            >
              <span className="text-xs">Test API</span>
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-gray-700 text-white rounded-tl-none'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {message.role === 'assistant' ? (
                    <Bot className="h-4 w-4 text-blue-400" />
                  ) : (
                    <User className="h-4 w-4 text-blue-400" />
                  )}
                  <span className="text-xs opacity-75">
                    {message.role === 'assistant' ? 'CyberGuard AI' : 'You'}
                  </span>
                </div>
                <div 
                  className="prose prose-sm prose-invert max-w-none"
                  dangerouslySetInnerHTML={formatMessage(message.content)}
                ></div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-4 bg-gray-700 text-white rounded-tl-none">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-blue-400" />
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex justify-center">
              <div className="max-w-[80%] rounded-lg p-4 bg-red-900 text-red-200 border border-red-700">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span>{error}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-gray-700">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your cybersecurity question..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>

          {/* Suggested Prompts */}
          <div className="mt-4">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Suggested questions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 focus:outline-none"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Help Card */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <HelpCircle className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">How to use the AI Assistant</h3>
        </div>
        <div className="space-y-2 text-gray-300">
          <p>Ask questions about:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>General cybersecurity concepts and best practices</li>
            <li>How to protect yourself against specific threats</li>
            <li>Security recommendations for your devices and accounts</li>
            <li>Analysis of potential security risks</li>
            <li>Explanations of security terminology</li>
          </ul>
          <p className="mt-3 text-gray-400 text-sm">
            The AI Assistant can provide general guidance but should not replace professional cybersecurity advice for critical systems or emergencies.
          </p>
          <div className="mt-3 flex items-center space-x-2">
            <Link className="h-4 w-4 text-blue-400" />
            <a href="#" className="text-blue-400 hover:underline text-sm">
              Learn more about our AI capabilities
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;