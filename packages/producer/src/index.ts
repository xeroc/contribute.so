import { RecurringPaymentsSDK } from "@tributary-so/sdk";
import { ChainWatcher } from "./watcher.js";
import { ChainCatchup } from "./catchup.js";
import { getConfig } from "./config.js";
import { RedisService } from "./redis.js";
import { Connection, Keypair } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";

async function main() {
  const config = getConfig();
  const connection = new Connection(config.SOLANA_API, {
    wsEndpoint: config.SOLANA_API.replace("https:", "wss:"),
  });
  const wallet = new Wallet(Keypair.generate());
  const sdk = new RecurringPaymentsSDK(connection, wallet);

  console.log("Starting combined catchup and real-time monitoring");

  // Create a shared Redis service instance
  const redisService = new RedisService(config.REDIS_URL);
  await redisService.connect();

  // For now, we'll focus on a single program. You can extend this to handle multiple programs like the Python version
  // You'll need to provide the correct path to your IDL file
  const watcher = new ChainWatcher(
    sdk.program,
    config.KAFKA_BOOTSTRAP_SERVERS,
    config.KAFKA_TOPIC_PREFIX,
    redisService,
  );

  const catchup = new ChainCatchup(
    sdk.program,
    config.KAFKA_TOPIC_PREFIX,
    redisService,
  );

  // Initialize components
  await watcher.initialize();
  await catchup.initialize();

  // Define the catchup task that will run periodically
  const periodicCatchup = async () => {
    while (true) {
      try {
        console.log(`Running scheduled catchup at ${new Date().toISOString()}`);

        const processResult = async (signature: string) => {
          await watcher.processTransaction(signature, true);
        };

        const processedCount = await catchup.catchUp(processResult);
        console.log(
          `Scheduled catchup completed. Processed ${processedCount} transactions.`,
        );

        // Wait for the next scheduled run (every hour)
        await new Promise((resolve) => setTimeout(resolve, 3600000)); // 1 hour
      } catch (error) {
        console.error("Error in periodic catchup:", error);
        // If there's an error, wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 300000)); // 5 minutes
      }
    }
  };

  try {
    // Start both the periodic catchup and real-time monitoring
    const catchupTask = periodicCatchup();
    const realtimeTask = watcher.run();

    // Wait for both tasks to complete (they should run indefinitely)
    await Promise.race([catchupTask, realtimeTask]);
  } catch (error) {
    console.error("Error in combined monitoring:", error);
  } finally {
    await watcher.close();
    await catchup.close();
    await redisService.disconnect();
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

main().catch(console.error);

