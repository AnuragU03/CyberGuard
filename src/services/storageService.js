// src/services/storageService.js
import { Web3Storage } from 'web3.storage';
import CryptoJS from 'crypto-js';
import { create } from 'ipfs-http-client';
import { getEncryptionKey, generateEncryptionKey } from './encryptionService';

// Configuration
const DEFAULT_GATEWAY = 'https://ipfs.io';

// Initialize IPFS client with a public gateway for HTTP client mode
let ipfsClient = null;

try {
  // Try to initialize with Infura or local node if available
  ipfsClient = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https'
  });
} catch (error) {
  console.warn('Failed to initialize IPFS client:', error);
}

// Local storage key for the index
const STORAGE_INDEX_KEY = 'cyberguard-storage-index';

// Service functions
const storageService = {
  /**
   * Initialize the storage service
   */
  async initialize() {
    // Ensure we have an encryption key
    try {
      const key = await getEncryptionKey();
      if (!key) {
        await generateEncryptionKey();
      }
      
      // Initialize local index if it doesn't exist
      if (!localStorage.getItem(STORAGE_INDEX_KEY)) {
        localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify([]));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize storage service:', error);
      return false;
    }
  },
  
  /**
   * Store data to IPFS
   * @param {any} data - The data to store
   * @param {Object} metadata - Metadata about the stored item
   * @param {boolean} encrypt - Whether to encrypt the data
   * @returns {Promise<Object>} - The result of the storage operation
   */
  async storeDataIPFS(data, metadata = {}, encrypt = true) {
    try {
      // Prepare data for storage
      let contentToStore = data;
      let isEncrypted = false;
      
      // Encrypt if requested
      if (encrypt) {
        const encryptionKey = await getEncryptionKey();
        if (encryptionKey) {
          const dataString = JSON.stringify(data);
          const encryptedData = CryptoJS.AES.encrypt(dataString, encryptionKey).toString();
          contentToStore = { encrypted: encryptedData };
          isEncrypted = true;
        } else {
          console.warn('Encryption requested but no key available, storing unencrypted');
        }
      }
      
      // Convert to string for IPFS storage
      const contentString = JSON.stringify(contentToStore);
      const contentBuffer = new TextEncoder().encode(contentString);
      
      // Store to IPFS if client available
      let cid;
      if (ipfsClient) {
        const result = await ipfsClient.add(contentBuffer);
        cid = result.path;
      } else {
        // Generate local mock CID if IPFS not available
        cid = 'local-' + CryptoJS.SHA256(contentString).toString().substring(0, 16);
        
        // Store in IndexedDB for local-only mode
        await this.storeInIndexedDB(cid, contentToStore);
      }
      
      // Update metadata
      const updatedMetadata = {
        ...metadata,
        isEncrypted,
        storageMethod: ipfsClient ? 'IPFS' : 'Local',
        gateway: DEFAULT_GATEWAY,
        timestamp: new Date().toISOString()
      };
      
      // Update local index
      await this.addToLocalIndex(cid, updatedMetadata);
      
      return {
        success: true,
        cid,
        metadata: updatedMetadata
      };
    } catch (error) {
      console.error('Failed to store data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Retrieve data from IPFS
   * @param {string} cid - The IPFS content identifier
   * @returns {Promise<Object>} - The retrieved data
   */
  async retrieveDataIPFS(cid) {
    try {
      let retrievedData;
      
      if (cid.startsWith('local-')) {
        // Retrieve from IndexedDB for local-only mode
        retrievedData = await this.retrieveFromIndexedDB(cid);
      } else if (ipfsClient) {
        // Retrieve from IPFS
        const stream = ipfsClient.cat(cid);
        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        const dataString = new TextDecoder().decode(buffer);
        retrievedData = JSON.parse(dataString);
      } else {
        // Fallback to gateway
        const response = await fetch(`${DEFAULT_GATEWAY}/ipfs/${cid}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch from gateway: ${response.status}`);
        }
        retrievedData = await response.json();
      }
      
      // Get metadata from local index
      const index = this.getLocalIndex();
      const itemEntry = index.find(item => item.cid === cid);
      
      // Decrypt if needed
      if (itemEntry?.metadata?.isEncrypted && retrievedData.encrypted) {
        const encryptionKey = await getEncryptionKey();
        if (encryptionKey) {
          const decryptedBytes = CryptoJS.AES.decrypt(retrievedData.encrypted, encryptionKey);
          const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
          retrievedData = JSON.parse(decryptedText);
        } else {
          throw new Error('Cannot decrypt: encryption key not available');
        }
      }
      
      return {
        success: true,
        data: retrievedData,
        metadata: itemEntry?.metadata
      };
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Get the local index of stored items
   * @returns {Array} - The local index
   */
  getLocalIndex() {
    try {
      const indexString = localStorage.getItem(STORAGE_INDEX_KEY);
      return indexString ? JSON.parse(indexString) : [];
    } catch (error) {
      console.error('Failed to get local index:', error);
      return [];
    }
  },
  
  /**
   * Add an item to the local index
   * @param {string} cid - The IPFS content identifier
   * @param {Object} metadata - Metadata about the stored item
   */
  async addToLocalIndex(cid, metadata) {
    try {
      const index = this.getLocalIndex();
      const timestamp = new Date().toISOString();
      
      // Check if CID already exists in index
      const existingIndex = index.findIndex(item => item.cid === cid);
      
      if (existingIndex >= 0) {
        // Update existing entry
        index[existingIndex] = {
          ...index[existingIndex],
          metadata: {
            ...index[existingIndex].metadata,
            ...metadata
          },
          timestamp
        };
      } else {
        // Add new entry
        index.push({
          cid,
          metadata,
          timestamp
        });
      }
      
      localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(index));
      return true;
    } catch (error) {
      console.error('Failed to add to local index:', error);
      return false;
    }
  },
  
  /**
   * Remove an item from the local index
   * @param {string} cid - The IPFS content identifier
   */
  async removeFromLocalIndex(cid) {
    try {
      const index = this.getLocalIndex();
      const updatedIndex = index.filter(item => item.cid !== cid);
      localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(updatedIndex));
      
      // Also remove from IndexedDB if it's a local item
      if (cid.startsWith('local-')) {
        await this.removeFromIndexedDB(cid);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to remove from local index:', error);
      return false;
    }
  },
  
  /**
   * Store data in IndexedDB for local-only mode
   * @param {string} cid - The content identifier
   * @param {any} data - The data to store
   */
  async storeInIndexedDB(cid, data) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CyberGuardStorage', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'cid' });
        }
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['data'], 'readwrite');
        const store = transaction.objectStore('data');
        
        const putRequest = store.put({ cid, data });
        
        putRequest.onsuccess = () => resolve(true);
        putRequest.onerror = () => reject(new Error('Failed to store in IndexedDB'));
        
        transaction.oncomplete = () => db.close();
      };
      
      request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    });
  },
  
  /**
   * Retrieve data from IndexedDB
   * @param {string} cid - The content identifier
   */
  async retrieveFromIndexedDB(cid) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CyberGuardStorage', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['data'], 'readonly');
        const store = transaction.objectStore('data');
        
        const getRequest = store.get(cid);
        
        getRequest.onsuccess = () => {
          if (getRequest.result) {
            resolve(getRequest.result.data);
          } else {
            reject(new Error('Item not found in IndexedDB'));
          }
        };
        
        getRequest.onerror = () => reject(new Error('Failed to retrieve from IndexedDB'));
        
        transaction.oncomplete = () => db.close();
      };
      
      request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    });
  },
  
  /**
   * Remove data from IndexedDB
   * @param {string} cid - The content identifier
   */
  async removeFromIndexedDB(cid) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CyberGuardStorage', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['data'], 'readwrite');
        const store = transaction.objectStore('data');
        
        const deleteRequest = store.delete(cid);
        
        deleteRequest.onsuccess = () => resolve(true);
        deleteRequest.onerror = () => reject(new Error('Failed to delete from IndexedDB'));
        
        transaction.oncomplete = () => db.close();
      };
      
      request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    });
  },
  
  /**
   * Clear all local storage
   */
  clearLocalStorage() {
    localStorage.removeItem(STORAGE_INDEX_KEY);
    
    // Clear IndexedDB
    const request = indexedDB.open('CyberGuardStorage', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      store.clear();
    };
    
    return true;
  }
};

// Initialize on load
storageService.initialize();

export default storageService;
