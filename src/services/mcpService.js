// src/services/mcpService.js
import { create } from 'ipfs-http-client';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';

// Default IPFS configuration
const DEFAULT_IPFS_CONFIG = {
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(
      `${process.env.REACT_APP_INFURA_PROJECT_ID}:${process.env.REACT_APP_INFURA_SECRET}`
    ).toString('base64')}`
  }
};

class MCPService {
  constructor() {
    this.ipfs = null;
    this.connected = false;
    this.connectionError = null;
    this.peers = new Set();
    this.subscriptions = new Map();
  }

  /**
   * Initialize the MCP service with custom IPFS configuration
   * @param {Object} config - Custom IPFS configuration
   */
  async initialize(config = {}) {
    try {
      const ipfsConfig = { ...DEFAULT_IPFS_CONFIG, ...config };
      this.ipfs = create(ipfsConfig);
      
      // Test connection
      const id = await this.ipfs.id();
      this.connected = true;
      this.connectionError = null;
      
      console.log('MCP Service initialized with ID:', id.id);
      return { success: true, id };
    } catch (error) {
      console.error('Failed to initialize MCP service:', error);
      this.connected = false;
      this.connectionError = error.message;
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if connected to IPFS
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Connect to a remote IPFS node
   * @param {string} multiaddr - Multiaddress of the node to connect to
   */
  async connectToNode(multiaddr) {
    if (!this.connected) {
      return { success: false, error: 'Not connected to IPFS' };
    }

    try {
      await this.ipfs.swarm.connect(multiaddr);
      this.peers.add(multiaddr);
      return { success: true };
    } catch (error) {
      console.error('Failed to connect to node:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Disconnect from a node
   * @param {string} multiaddr - Multiaddress of the node to disconnect from
   */
  async disconnectFromNode(multiaddr) {
    if (!this.connected) {
      return { success: false, error: 'Not connected to IPFS' };
    }

    try {
      await this.ipfs.swarm.disconnect(multiaddr);
      this.peers.delete(multiaddr);
      return { success: true };
    } catch (error) {
      console.error('Failed to disconnect from node:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Store data on IPFS
   * @param {any} data - Data to store
   * @param {Object} options - Additional options
   */
  async storeDataIPFS(data, options = {}) {
    if (!this.connected) {
      return { success: false, error: 'Not connected to IPFS' };
    }

    try {
      const content = JSON.stringify(data);
      const result = await this.ipfs.add({ content });
      
      // Pin the content if requested
      if (options.pin) {
        await this.ipfs.pin.add(result.cid);
      }
      
      return { 
        success: true, 
        cid: result.cid.toString(),
        path: result.path,
        size: result.size
      };
    } catch (error) {
      console.error('Failed to store data on IPFS:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retrieve data from IPFS
   * @param {string} cid - Content identifier
   */
  /**
   * Retrieve data from IPFS
   * @param {string} cid - Content identifier
   * @param {Object} options - Additional options
   */
  async retrieveDataIPFS(cid, options = {}) {
    if (!this.connected) {
      return { success: false, error: 'Not connected to IPFS' };
    }

    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(cid, options)) {
        chunks.push(chunk);
      }
      
      const data = Buffer.concat(chunks).toString();
      
      try {
        return { 
          success: true, 
          data: JSON.parse(data),
          cid
        };
      } catch (e) {
        return { 
          success: true, 
          data: data,
          cid
        };
      }
    } catch (error) {
      console.error('Failed to retrieve data from IPFS:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe to a pubsub topic
   * @param {string} topic - Topic to subscribe to
   * @param {Function} handler - Message handler function
   */
  async subscribe(topic, handler) {
    if (!this.connected) {
      throw new Error('Not connected to IPFS');
    }

    try {
      const subscription = this.ipfs.pubsub.subscribe(topic, handler);
      this.subscriptions.set(topic, subscription);
      return { success: true };
    } catch (error) {
      console.error(`Failed to subscribe to topic ${topic}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unsubscribe from a pubsub topic
   * @param {string} topic - Topic to unsubscribe from
   */
  async unsubscribe(topic) {
    if (!this.connected) {
      throw new Error('Not connected to IPFS');
    }

    try {
      const subscription = this.subscriptions.get(topic);
      if (subscription) {
        await subscription.unsubscribe();
        this.subscriptions.delete(topic);
      }
      return { success: true };
    } catch (error) {
      console.error(`Failed to unsubscribe from topic ${topic}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Publish a message to a pubsub topic
   * @param {string} topic - Topic to publish to
   * @param {any} data - Data to publish
   */
  async publish(topic, data) {
    if (!this.connected) {
      throw new Error('Not connected to IPFS');
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      await this.ipfs.pubsub.publish(topic, Buffer.from(message));
      return { success: true };
    } catch (error) {
      console.error(`Failed to publish to topic ${topic}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get peer information
   */
  async getPeerInfo() {
    if (!this.connected) {
      throw new Error('Not connected to IPFS');
    }

    try {
      const id = await this.ipfs.id();
      const peers = await this.ipfs.swarm.peers();
      
      return {
        success: true,
        peerId: id.id,
        agentVersion: id.agentVersion,
        protocolVersion: id.protocolVersion,
        publicKey: id.publicKey,
        addresses: id.addresses,
        connectedPeers: peers.length
      };
    } catch (error) {
      console.error('Failed to get peer info:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Ping a remote peer
   * @param {string} peerId - Peer ID to ping
   * @param {number} count - Number of pings to send (default: 1)
   */
  async ping(peerId, count = 1) {
    if (!this.connected) {
      throw new Error('Not connected to IPFS');
    }

    try {
      const results = [];
      for await (const result of this.ipfs.ping(peerId, { count })) {
        results.push({
          success: result.success,
          time: result.time,
          text: result.text
        });
      }
      return { success: true, results };
    } catch (error) {
      console.error(`Failed to ping peer ${peerId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a list of connected peers
   */
  async getConnectedPeers() {
    if (!this.connected) {
      throw new Error('Not connected to IPFS');
    }

    try {
      const peers = await this.ipfs.swarm.peers();
      return { 
        success: true, 
        peers: peers.map(peer => ({
          addr: peer.addr,
          peer: peer.peer,
          latency: peer.latency,
          muxer: peer.muxer,
          streams: peer.streams
        }))
      };
    } catch (error) {
      console.error('Failed to get connected peers:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get the current node's ID information
   */
  async getId() {
    if (!this.connected) {
      throw new Error('Not connected to IPFS');
    }

    try {
      const id = await this.ipfs.id();
      return { success: true, id };
    } catch (error) {
      console.error('Failed to get node ID:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get the current node's version information
   */
  async getVersion() {
    if (!this.connected) {
      throw new Error('Not connected to IPFS');
    }

    try {
      const version = await this.ipfs.version();
      return { success: true, version };
    } catch (error) {
      console.error('Failed to get node version:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    try {
      // Unsubscribe from all topics
      for (const [topic, subscription] of this.subscriptions.entries()) {
        try {
          await subscription.unsubscribe();
        } catch (error) {
          console.error(`Error unsubscribing from topic ${topic}:`, error);
        }
      }
      this.subscriptions.clear();
      
      // Disconnect from all peers
      if (this.ipfs) {
        const peers = await this.ipfs.swarm.peers();
        for (const peer of peers) {
          try {
            await this.ipfs.swarm.disconnect(peer.addr);
          } catch (error) {
            console.error(`Error disconnecting from peer ${peer.peer}:`, error);
          }
        }
      }
      
      this.connected = false;
      this.ipfs = null;
      return { success: true };
    } catch (error) {
      console.error('Error during cleanup:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Ping a remote node to check connectivity
   * @param {string} nodeAddress - The address of the node to ping
   */
  async pingNode(nodeAddress) {
    console.log(`Would ping node: ${nodeAddress}`);
    return {
      success: false,
      latency: null,
      error: 'Ping functionality not implemented yet'
    };
  }

  /**
   * Get a list of available nodes
   */
  async getAvailableNodes() {
    return {
      success: true,
      nodes: [
        {
          id: 'node-1',
          name: 'CyberGuard Public Node 1',
          address: 'ipfs.cyberguard.example',
          status: 'offline',
          region: 'North America'
        },
        {
          id: 'node-2',
          name: 'CyberGuard Public Node 2',
          address: 'ipfs-eu.cyberguard.example',
          status: 'offline',
          region: 'Europe'
        }
      ]
    };
  }
}

// Create and export a singleton instance
const mcpService = new MCPService();

export default mcpService;
