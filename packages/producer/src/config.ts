import { z } from "zod";

const configSchema = z.object({
  // Solana
  SOLANA_API: z.string().default("https://api.mainnet-beta.solana.com"),
  // SOLANA_API: z.string().default('https://api.devnet.solana.com'),

  // Program ID we want to monitor
  PROGRAM_ID: z.string().default("TRibg8W8zmPHQqWtyAD1rEBRXEdyU13Mu6qX1Sg42tJ"),

  // comma separated list of kafka bootstrap servers
  KAFKA_BOOTSTRAP_SERVERS: z.string().default("localhost:9092"),
  KAFKA_TOPIC_PREFIX: z.string().default("tributary"),

  // Redis for some caching
  REDIS_URL: z.string().default("redis://localhost:6379/0"),
});

export type Config = z.infer<typeof configSchema>;

let config: Config | null = null;

export function getConfig(): Config {
  if (config === null) {
    config = configSchema.parse(process.env);
  }
  return config;
}
