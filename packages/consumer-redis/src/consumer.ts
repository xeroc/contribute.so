import * as dotenv from "dotenv";
import { Kafka, type KafkaMessage } from "kafkajs";
import { createClient } from "redis";
import jsonQuery from "json-query";
dotenv.config();

type TopicRedisConfiguration = {
  topic: string;
  filter: string;
  value: string;
  channels: string[];
};

// Configuration
const DEFAULT_TOPIC_CHANNEL_MAP: TopicRedisConfiguration[] = [
  // {
  //   topic: "vault_VaultDepositorRecord",
  //   filter: "event_data.action.record_name",
  //   value: "Deposit",
  //   channels: ["events:vault:vault_equity_update_required"],
  // },
];
const groupId = process.env.KAFKA_CONSUMER_GROUP_NAME || "consumer-redis";
const REDIS_URL = process.env.REDIS_URL_DATAAGG || "redis://localhost:6379";
const TOPIC_CHANNEL_MAP: TopicRedisConfiguration[] =
  JSON.parse(
    process.env.TOPIC_CHANNEL_MAP || JSON.stringify(DEFAULT_TOPIC_CHANNEL_MAP),
  ) || DEFAULT_TOPIC_CHANNEL_MAP;
const TOPICS = TOPIC_CHANNEL_MAP.map((config) => config.topic);

console.log(
  `Messages to be forwarded to redis: ${JSON.stringify(TOPIC_CHANNEL_MAP, null, 3)}`,
);

// Initialize Redis client
async function initializeRedisClient() {
  const client = createClient({
    url: REDIS_URL,
    socket: {
      keepAlive: 90,
    },
  });

  client.on("error", (err) => console.error("Redis Client Error", err));
  client.on("reconnecting", () => console.log("Redis reconnecting..."));

  await client.connect();
  return client;
}

// Initialize Kafka
function initializeKafka() {
  const bootstrapServers = process.env.KAFKA_BOOTSTRAP_SERVERS;
  if (!bootstrapServers) {
    throw new Error("KAFKA_BOOTSTRAP_SERVERS in .env are not defined");
  }

  const kafka = new Kafka({
    clientId: "consumer-redis",
    brokers: bootstrapServers.split(","),
  });

  return kafka;
}

function initializeConsumer() {
  const kafka = initializeKafka();

  const consumer = kafka.consumer({
    groupId: groupId,
  });

  return consumer;
}

// Ensure Redis connection is alive
async function ensureRedisConnection(redisClient: any) {
  try {
    await redisClient.ping();
  } catch (error) {
    console.warn("Redis connection lost, reconnecting...");
    await redisClient.connect();
  }
}

// Process message and handle deduplication
async function processMessage(redisClient: any, topic: string, message: any) {
  try {
    // Ensure connection is alive before processing
    await ensureRedisConnection(redisClient);

    const values = message.value ? JSON.parse(message.value.toString()) : "";

    if (!values || !values.signature) {
      console.warn("Received message without signature, skipping");
      return;
    }

    // Check if we've already processed this signature
    const key = `consumer-redis:${values.signature}`;
    const exists = await redisClient.exists(key);

    if (exists) {
      console.info(
        `Duplicate message with signature: ${values.signature}, skipping`,
      );
      return;
    }

    // Store signature in Redis with a TTL (e.g., 24 hours)
    await redisClient.set(key, "1", { EX: 86400 });

    // get redis channel for message
    const configs = TOPIC_CHANNEL_MAP.filter(
      (config) => config.topic === topic,
    );
    for (const config of configs) {
      // Does the filter match? Skip if not
      const queryResult = jsonQuery(config.filter, { data: values });
      if (queryResult.value != config.value) {
        continue;
      }

      const redisChannels = config.channels;
      if (!redisChannels) {
        console.warn(`Topic ${topic} not defined in topic-channels-map!`);
      }

      for (const redisChannel of redisChannels) {
        // Publish message to Redis channel
        console.info(
          `Publishing message with signature: ${values.signature} to channel: ${redisChannel}`,
        );
        await redisClient.publish(redisChannel, JSON.stringify(values));
      }
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
}

// Store references for cleanup
let consumer: any;
let redisClient: any;

async function runConsumer() {
  consumer = initializeConsumer();
  redisClient = await initializeRedisClient();

  try {
    await consumer.connect();
    console.info(`Subscribing to topics: ${TOPICS.join(", ")}`);
    await consumer.subscribe({ topics: TOPICS, fromBeginning: false });

    await consumer.run({
      autoCommitInterval: 5000,
      eachMessage: async ({
        topic,
        partition,
        message,
      }: {
        topic: string;
        partition: number;
        message: KafkaMessage;
      }) => {
        await processMessage(redisClient, topic, message);
      },
    });
  } catch (error) {
    console.error("Consumer error:", error);
  } finally {
    // This will never execute unless the consumer is stopped
    await redisClient.quit();
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Caught interrupt signal, shutting down gracefully");
  if (consumer) await consumer.disconnect();
  if (redisClient) await redisClient.quit();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Caught terminate signal, shutting down gracefully");
  if (consumer) await consumer.disconnect();
  if (redisClient) await redisClient.quit();
  process.exit(0);
});

// Start the consumer
runConsumer().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
