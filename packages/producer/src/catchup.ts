import { createClient, RedisClientType } from "redis";
import { Connection, PublicKey } from "@solana/web3.js";
import { getConfig } from "./config.js";
import { type Program } from "@tributary-so/sdk";

export class ChainCatchup {
  private checkpointKey: string;
  private signaturePrefix: string;
  private signatureExpirySeconds: number = 2592000; // Default: 30 days (1 month)
  private connection: Connection;
  private redisClient: RedisClientType | null = null;
  private programId: PublicKey;
  private program: Program;

  constructor(program: Program, kafkaTopic?: string, redisUrl?: string) {
    this.program = program;
    this.connection = program.provider.connection;
    this.programId = program.programId;

    if (redisUrl) {
      this.redisClient = createClient({ url: redisUrl });
      this.redisClient.connect();
    }

    this.checkpointKey = `${kafkaTopic || getConfig().KAFKA_TOPIC_PREFIX}-chainwatcher-checkpoint`;
    this.signaturePrefix = `${kafkaTopic || getConfig().KAFKA_TOPIC_PREFIX}-chainwatcher-sig:`;
  }

  async initialize(): Promise<void> {
    // Initialize Redis connection if needed
    if (this.redisClient) {
      await this.redisClient.connect();
    }
  }

  storeSignature(signature: string): boolean {
    if (!this.redisClient) {
      return false;
    }

    const key = `${this.signaturePrefix}${signature}`;
    const value = JSON.stringify({
      signature,
      processed_at: Date.now(),
    });

    // Note: Redis v4 uses promises
    this.redisClient.setEx(key, this.signatureExpirySeconds, value);
    return true;
  }

  async isSignatureProcessed(signature: string): Promise<boolean> {
    if (!this.redisClient) {
      return false;
    }

    const key = `${this.signaturePrefix}${signature}`;
    const exists = await this.redisClient.exists(key);
    return exists === 1;
  }

  async processSignature(signature: string): Promise<boolean> {
    // Check if we've already processed this signature
    const isProcessed = await this.isSignatureProcessed(signature);
    if (isProcessed) {
      console.log(`Skipping already processed transaction: ${signature}`);
      return false;
    }

    // Store the signature in Redis
    return this.storeSignature(signature);
  }

  async catchUp(
    callback?: (signature: string) => Promise<void>,
  ): Promise<number> {
    console.log(
      "Starting catchup through the entire 1000 last transaction signatures",
    );

    const signatures = await this.connection.getSignaturesForAddress(
      this.programId,
      { limit: 1000 },
    );

    let processedCount = 0;
    for (const sigInfo of signatures.reverse()) {
      const signature = sigInfo.signature;

      const shouldProcess = await this.processSignature(signature);
      if (!shouldProcess) {
        continue;
      }

      if (callback) {
        await callback(signature);
      }

      this.saveCheckpoint(signature);
      processedCount++;
    }

    console.log(`Catchup completed. Processed ${processedCount} transactions.`);
    return processedCount;
  }

  async getLastCheckpoint(): Promise<any> {
    if (!this.redisClient) {
      return {};
    }
    const checkpoint = await this.redisClient.get(this.checkpointKey);
    return checkpoint ? JSON.parse(checkpoint) : {};
  }

  saveCheckpoint(signature: string, additionalInfo: any = {}): void {
    if (!this.redisClient) {
      throw new Error("No redis_client specified!");
    }
    const checkpointData = {
      last_signature: signature,
      timestamp: Date.now(),
      ...additionalInfo,
    };
    this.redisClient.set(this.checkpointKey, JSON.stringify(checkpointData));
  }

  async close(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.disconnect();
    }
  }
}
