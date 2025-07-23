import CryptoJS from 'crypto-js';

// Configuration
const ENCRYPTION_KEY_NAME = 'cyberguard-encryption-key';

/**
 * Get the user's encryption key from secure storage
 * @returns {Promise<string>} The encryption key or null if not found
 */
export const getEncryptionKey = async () => {
  try {
    // For browser environments, we'll use localStorage
    // In a production app, consider using a more secure solution
    // like the Web Crypto API with a hardware-backed key store
    const storedKey = localStorage.getItem(ENCRYPTION_KEY_NAME);
    
    if (!storedKey) {
      return null;
    }
    
    return storedKey;
  } catch (error) {
    console.error('Failed to get encryption key:', error);
    return null;
  }
};

/**
 * Generate a new encryption key and store it securely
 * @returns {Promise<string>} The generated encryption key
 */
export const generateEncryptionKey = async () => {
  try {
    // Generate a random key
    // In a production app, consider using the Web Crypto API
    const randomArray = new Uint8Array(32); // 256 bits
    window.crypto.getRandomValues(randomArray);
    
    // Convert to hex string for storage
    const hexString = Array.from(randomArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Store the key
    localStorage.setItem(ENCRYPTION_KEY_NAME, hexString);
    
    return hexString;
  } catch (error) {
    console.error('Failed to generate encryption key:', error);
    throw error;
  }
};

/**
 * Encrypt data using AES-256
 * @param {any} data - The data to encrypt
 * @param {string} key - The encryption key (optional, will use stored key if not provided)
 * @returns {Promise<string>} The encrypted data as a string
 */
export const encryptData = async (data, key = null) => {
  try {
    const encryptionKey = key || await getEncryptionKey();
    
    if (!encryptionKey) {
      throw new Error('No encryption key available');
    }
    
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(dataString, encryptionKey).toString();
    
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw error;
  }
};

/**
 * Decrypt data using AES-256
 * @param {string} encryptedData - The encrypted data string
 * @param {string} key - The encryption key (optional, will use stored key if not provided)
 * @returns {Promise<any>} The decrypted data
 */
export const decryptData = async (encryptedData, key = null) => {
  try {
    const encryptionKey = key || await getEncryptionKey();
    
    if (!encryptionKey) {
      throw new Error('No encryption key available');
    }
    
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    try {
      // Try to parse as JSON if possible
      return JSON.parse(decryptedText);
    } catch {
      // Return as string if not valid JSON
      return decryptedText;
    }
  } catch (error) {
    console.error('Decryption failed:', error);
    throw error;
  }
};

/**
 * Compute a hash of the data using SHA-256
 * @param {any} data - The data to hash
 * @returns {string} The SHA-256 hash as a hex string
 */
export const computeHash = (data) => {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.SHA256(dataString).toString();
};

/**
 * Generate a random salt for password hashing
 * @returns {string} A random salt string
 */
export const generateSalt = () => {
  return CryptoJS.lib.WordArray.random(128 / 8).toString();
};

/**
 * Hash a password with a salt using PBKDF2
 * @param {string} password - The password to hash
 * @param {string} salt - The salt to use
 * @returns {string} The hashed password
 */
export const hashPassword = (password, salt) => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000
  }).toString();
};

export default {
  getEncryptionKey,
  generateEncryptionKey,
  encryptData,
  decryptData,
  computeHash,
  generateSalt,
  hashPassword
};