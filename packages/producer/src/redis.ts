import { createClient, RedisClientType } from 'redis';

export interface CheckpointData {
  last_signature: string;
  timestamp: number;
  [key: string]: any;
}

export interface SignatureData {
  signature: string;
  processed_at: number;
}

export class RedisService {
  private client: RedisClientType | null = null;
  private signatureExpirySeconds: number = 2592000; // Default: 30 days (1 month)
  private isConnected: boolean = false;

  constructor(redisUrl?: string) {
    if (redisUrl) {
      this.client = createClient({ url: redisUrl });
    }
  }

  async connect(): Promise<void> {
    if (this.client && !this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  isInitialized(): boolean {
    return this.client !== null;
  }

  /**
   * Store a transaction signature in Redis with expiration.
   */
  storeSignature(signature: string, prefix: string): boolean {
    if (!this.client || !this.isConnected) {
      return false;
    }

    const key = `${prefix}${signature}`;
    const value: SignatureData = {
      signature,
      processed_at: Date.now(),
    };

    this.client.setEx(key, this.signatureExpirySeconds, JSON.stringify(value));
    return true;
  }

  /**
   * Check if a signature has already been processed.
   */
  async isSignatureProcessed(signature: string, prefix: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    const key = `${prefix}${signature}`;
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  /**
   * Get the last checkpoint from Redis.
   */
  async getLastCheckpoint(checkpointKey: string): Promise<CheckpointData | null> {
    if (!this.client || !this.isConnected) {
      return null;
    }

    const checkpoint = await this.client.get(checkpointKey);
    return checkpoint ? JSON.parse(checkpoint) : null;
  }

  /**
   * Save a checkpoint to Redis.
   */
  saveCheckpoint(checkpointKey: string, signature: string, additionalInfo: Record<string, any> = {}): boolean {
    if (!this.client || !this.isConnected) {
      return false;
    }

    const checkpointData: CheckpointData = {
      last_signature: signature,
      timestamp: Date.now(),
      ...additionalInfo,
    };

    this.client.set(checkpointKey, JSON.stringify(checkpointData));
    return true;
  }

  /**
   * Get the Redis client instance (for advanced operations if needed)
   */
  getClient(): RedisClientType | null {
    return this.client;
  }
}