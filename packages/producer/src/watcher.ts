import WebSocket from "ws";
import { Kafka, Producer, Admin } from "kafkajs";
import { Connection, PublicKey } from "@solana/web3.js";
import { type Program } from "@tributary-so/sdk";
import { ChainscopeParser } from "./parser.js";
import { getConfig } from "./config.js";
import { RedisService } from "./redis.js";

export class ChainWatcher {
  private program: Program;
  private kafkaBootstrapServers?: string;
  private kafkaTopic: string;
  private programId: PublicKey;
  private parser: ChainscopeParser;
  private connection: Connection;
  private checkpointKey: string;
  private signaturePrefix: string;
  private redisService: RedisService;
  private producer: Producer | null = null;
  private admin: Admin | null = null;

  constructor(
    program: Program,
    kafkaBootstrapServers?: string,
    kafkaTopic?: string,
    redisService?: RedisService,
  ) {
    this.program = program;
    this.kafkaBootstrapServers = kafkaBootstrapServers;
    this.kafkaTopic = kafkaTopic || getConfig().KAFKA_TOPIC_PREFIX;
    this.programId = program.programId;
    this.connection = program.provider.connection;
    this.redisService = redisService || new RedisService();

    this.parser = new ChainscopeParser(this.program);

    this.checkpointKey = `${this.kafkaTopic}-chainwatcher-checkpoint`;
    this.signaturePrefix = `${this.kafkaTopic}-chainwatcher-sig:`;
  }

  async initialize(): Promise<void> {
    await this.parser.initialize();

    if (this.kafkaBootstrapServers) {
      const kafka = new Kafka({
        clientId: "chainscope-producer",
        brokers: this.kafkaBootstrapServers.split(","),
      });

      this.producer = kafka.producer({
        allowAutoTopicCreation: true,
        transactionTimeout: 30000,
      });

      await this.producer.connect();

      this.admin = kafka.admin();
      await this.admin.connect();

      // Create topics
      const topics = [
        {
          topic: `${this.kafkaTopic}_transactions`,
          numPartitions: 1,
          replicationFactor: 1,
        },
      ];

      // Add event-specific topics
      for (const event of this.program.idl.events) {
        topics.push({
          topic: `${this.kafkaTopic}_${event.name}`,
          numPartitions: 1,
          replicationFactor: 1,
        });
      }

      try {
        await this.admin.createTopics({
          topics,
          validateOnly: false,
        });
      } catch (error: any) {
        if (!error.message?.includes("already exists")) {
          throw error;
        }
      }

      console.log("Created all topics on Kafka");
    }
  }

  async close(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
    }
    if (this.admin) {
      await this.admin.disconnect();
    }
  }

  sendToKafka(data: any): void {
    if (!this.producer) return;

    // Send the base transaction data
    const txData = { ...data };
    delete txData.events;
    const txTopic = `${this.kafkaTopic}_transactions`;
    this.producer.send({
      topic: txTopic,
      messages: [{ value: JSON.stringify(txData) }],
    });

    // Send events individually
    const baseData = { ...data };
    delete baseData.events;
    delete baseData.transaction;

    if (data.events) {
      for (let index = 0; index < data.events.length; index++) {
        const event = data.events[index];
        const topic = `${this.kafkaTopic}_${event.name}`;
        const kafkaData = {
          index,
          event_data: event.data,
          ...baseData,
        };
        this.producer.send({
          topic,
          messages: [{ value: JSON.stringify(kafkaData) }],
        });
      }
    }

    // Note: KafkaJS producer automatically handles flushing
  }

  async getTransaction(signature: string): Promise<any> {
    while (true) {
      try {
        const tx = await this.connection.getTransaction(signature, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        });
        return tx;
      } catch (error: any) {
        // Check if it's a rate limit error
        if (
          error.message?.includes("rate limit") ||
          error.message?.includes("429")
        ) {
          console.warn("Rate limited. Waiting before retry...");
          await new Promise((resolve) => setTimeout(resolve, 20000));
          continue;
        } else {
          throw error;
        }
      }
    }
  }

  storeSignature(signature: string): boolean {
    return this.redisService.storeSignature(signature, this.signaturePrefix);
  }

  async isSignatureProcessed(signature: string): Promise<boolean> {
    return this.redisService.isSignatureProcessed(
      signature,
      this.signaturePrefix,
    );
  }

  async processTransaction(
    signature: string,
    skipCheck: boolean = false,
  ): Promise<any> {
    // Check if we've already processed this signature
    if (!skipCheck) {
      const isProcessed = await this.isSignatureProcessed(signature);
      if (isProcessed) {
        console.log(`Skipping already processed transaction: ${signature}`);
        return { status: "already_processed" };
      }
    }

    console.log(`Processing transaction: ${signature}`);

    const tx = await this.getTransaction(signature);
    if (!tx || !tx.meta || tx.meta.err) {
      return { error: "Transaction not found or failed" };
    }

    const result = await this.parser.parseTransaction(tx, signature);
    this.sendToKafka(result);

    // Store the signature in Redis
    this.storeSignature(signature);

    return result;
  }

  async monitorRealtime(): Promise<void> {
    const subscribeMessage = {
      jsonrpc: "2.0",
      id: 1,
      method: "logsSubscribe",
      params: [
        { mentions: [this.programId.toString()] },
        { commitment: "confirmed" },
      ],
    };

    return new Promise((resolve, reject) => {
      const ws = new WebSocket(
        getConfig().SOLANA_API.replace("https:", "wss:"),
      );

      ws.on("open", () => {
        console.log(`Subscribing via WebSocket`);
        ws.send(JSON.stringify(subscribeMessage));
      });

      ws.on("message", async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          const result = message.params?.result;

          if (result && result.value && !result.value.err) {
            const signature = result.value.signature;
            await this.processTransaction(signature);
            this.saveCheckpoint(signature);
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      });

      ws.on("close", () => {
        console.error("WebSocket connection closed. Reconnecting...");
        resolve(); // Resolve to allow reconnection
      });
    });
  }

  async run(): Promise<void> {
    while (true) {
      try {
        await this.monitorRealtime();
      } catch (error) {
        console.error("An error occurred:", error);
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait before retrying
      }
    }
  }

  async getLastCheckpoint(): Promise<any> {
    const checkpoint = await this.redisService.getLastCheckpoint(
      this.checkpointKey,
    );
    return checkpoint || {};
  }

  saveCheckpoint(signature: string, additionalInfo: any = {}): void {
    this.redisService.saveCheckpoint(
      this.checkpointKey,
      signature,
      additionalInfo,
    );
  }
}
