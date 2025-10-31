import * as dotenv from "dotenv";
import { Kafka } from "kafkajs";
import { MongoClient, MongoError } from "mongodb";
import crypto from "crypto";
import { RecurringPaymentsSDK } from "@tributary-so/sdk";
import { Connection, Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
dotenv.config();

// change groupId each time you run to be able to read all messages
const groupId = process.env.KAFKA_CONSUMER_GROUP_NAME || "consumer-mongo";
const dbName = process.env.MONGO_DATABASE || "db";
const solana_api = process.env.SOLANA_API as string;
if (!solana_api) {
  throw new Error("SOLANA_API required");
}
const sdk = new RecurringPaymentsSDK(
  new Connection(solana_api),
  new anchor.Wallet(Keypair.generate()),
);

function initializeKafka() {
  const bootstrapServers = process.env.KAFKA_BOOTSTRAP_SERVERS;
  if (!bootstrapServers) {
    throw new Error("KAFKA_BOOTSTRAP_SERVERS in .env are not defined");
  }

  const kafka = new Kafka({
    clientId: "consumer-mongo",
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

let mongoClient: MongoClient | null = null;

export function initializeMongoClient() {
  const mongoUrl = process.env.MONGODB_URI;
  if (!mongoUrl) {
    throw new Error("MONGODB_URI in .env are not defined");
  }

  const client = new MongoClient(mongoUrl);
  return client;
}

export async function connectMongoClient() {
  if (!mongoClient) {
    mongoClient = initializeMongoClient();
    await mongoClient.connect();
  }
  return mongoClient;
}

export async function closeMongoClient() {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
  }
}

function getTopics() {
  const topics = sdk.program.idl.events.map(
    (event) => "tributary_" + event.name,
  );
  topics.push("tributary_transactions");
  return topics;
}

async function storeTx(data: any) {
  console.info(`Storing transaction with signature: ${data.signature}`);
  const client = await connectMongoClient();
  const db = client.db(dbName);
  const collection = db.collection("transactions");

  try {
    await collection.insertOne({
      ...data,
      _id: data.signature,
    });
  } catch (e) {
    if (e instanceof MongoError && e.code === 11000) {
      // Silently skip duplicate key errors
      return;
    }
    throw e; // Re-throw other errors
  }
}

async function storeEvent(data: any) {
  const client = await connectMongoClient();
  const db = client.db(dbName);
  const collection = db.collection("events");
  console.info(
    `Storing new event in signature ${data.signature}: ${data.event_type} @ ${data.slot}`,
  );

  try {
    const idString = `${data.signature}_${data.index}_${data.event_type}`;
    const hash = crypto.createHash("sha256").update(idString).digest("hex");
    await collection.insertOne({
      ...data,
      _id: hash,
    });
  } catch (e) {
    if (e instanceof MongoError && e.code === 11000) {
      // Silently skip duplicate key errors
      return;
    }
    throw e; // Re-throw other errors
  }
}

async function runConsumer() {
  const consumer = initializeConsumer();

  const topics = getTopics();

  try {
    await connectMongoClient();
    await consumer.connect();

    await consumer.subscribe({ topics: topics, fromBeginning: true });

    await consumer.run({
      autoCommitInterval: 5000,
      eachMessage: async ({ topic, partition, message }) => {
        const values = message.value
          ? JSON.parse(message.value.toString())
          : "";

        if (topic === "tributary_transactions") {
          await storeTx(values);
        } else {
          values.event_type = topic;
          await storeEvent(values);
        }
      },
    });
  } catch (error) {
    console.error(error);
  } finally {
    await closeMongoClient();
  }

  await new Promise((resolve) => setTimeout(resolve, 5000));
}

runConsumer().catch(async (error) => {
  console.error(error);
  await closeMongoClient();
  process.exit(1);
});
