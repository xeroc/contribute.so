import { Connection, PublicKey } from "@solana/web3.js";
import { getConfig } from "./config.js";
import { type Program } from "@tributary-so/sdk";
import { RedisService } from "./redis.js";

export class ChainCatchup {
  private checkpointKey: string;
  private signaturePrefix: string;
  private connection: Connection;
  private redisService: RedisService;
  private programId: PublicKey;
  private program: Program;

  constructor(program: Program, kafkaTopic?: string, redisService?: RedisService) {
    this.program = program;
    this.connection = program.provider.connection;
    this.programId = program.programId;
    this.redisService = redisService || new RedisService();

    this.checkpointKey = `${kafkaTopic || getConfig().KAFKA_TOPIC_PREFIX}-chainwatcher-checkpoint`;
    this.signaturePrefix = `${kafkaTopic || getConfig().KAFKA_TOPIC_PREFIX}-chainwatcher-sig:`;
  }

  async initialize(): Promise<void> {
    // Redis connection is managed by RedisService
  }

  storeSignature(signature: string): boolean {
    return this.redisService.storeSignature(signature, this.signaturePrefix);
  }

  async isSignatureProcessed(signature: string): Promise<boolean> {
    return this.redisService.isSignatureProcessed(signature, this.signaturePrefix);
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
    const checkpoint = await this.redisService.getLastCheckpoint(this.checkpointKey);
    return checkpoint || {};
  }

  saveCheckpoint(signature: string, additionalInfo: any = {}): void {
    this.redisService.saveCheckpoint(this.checkpointKey, signature, additionalInfo);
  }

  async close(): Promise<void> {
    // Redis connection is managed by RedisService
  }
}
