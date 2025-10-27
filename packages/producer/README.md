# Solana Kafka Producer

A robust TypeScript implementation of a Kafka producer that sends Solana/Anchor events to Kafka topics. This implementation provides both catch-up functionality (to process missed transactions) and real-time monitoring.

## Features

- **Real-time Monitoring**: Subscribes to Solana logs via WebSocket to monitor transactions in real-time
- **Catch-up Processing**: Processes missed transactions during downtime
- **Kafka Integration**: Sends transaction data and individual events to separate Kafka topics
- **Redis Caching**: Uses Redis for deduplication and checkpointing
- **Anchor Event Parsing**: Parses Anchor program events from transaction logs

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy the environment file:

```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:

```env
# Solana RPC endpoint
SOLANA_API=https://api.mainnet-beta.solana.com

# Program IDs to monitor
PROGRAM_ID=your_program_id_here
VAULT_PROGRAM_ID=your_vault_program_id_here

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_TOPIC_PREFIX=tributary

# Redis for caching and checkpoints
REDIS_URL=redis://localhost:6379/0

# Path to the Anchor IDL file
IDL_PATH=./idl.json
```

4. Place your Anchor IDL file at the path specified in `IDL_PATH`

## Usage

Start the producer:

```bash
pnpm start
```

This will:

1. Initialize Kafka topics for transactions and events
2. Start periodic catch-up processing (every hour)
3. Begin real-time monitoring via WebSocket

## Architecture

### Topics Created

The producer creates the following Kafka topics:

- `{KAFKA_TOPIC_PREFIX}_transactions`: Contains base transaction data
- `{KAFKA_TOPIC_PREFIX}_{event_name}`: Individual topics for each Anchor event type

### Components

- **ChainWatcher**: Handles real-time WebSocket monitoring and transaction processing
- **ChainCatchup**: Processes missed transactions during downtime
- **ChainscopeParser**: Parses Anchor events from transaction logs

### Data Flow

1. **Real-time**: WebSocket subscription receives new transaction signatures
2. **Catch-up**: Periodic fetching of recent transaction signatures from Solana
3. **Processing**: Each transaction is fetched, parsed for events, and sent to Kafka
4. **Deduplication**: Redis ensures transactions aren't processed multiple times

## Development

Build the project:

```bash
pnpm build
```

Run in development mode:

```bash
pnpm dev
```

Lint the code:

```bash
pnpm lint
```

## Configuration

### Environment Variables

- `SOLANA_API`: Solana RPC endpoint URL
- `PROGRAM_ID`: The program ID to monitor
- `KAFKA_BOOTSTRAP_SERVERS`: Comma-separated list of Kafka brokers
- `KAFKA_TOPIC_PREFIX`: Prefix for Kafka topic names
- `REDIS_URL`: Redis connection URL
- `IDL_PATH`: Path to the Anchor IDL JSON file

### IDL File

The IDL file should be a standard Anchor IDL JSON file containing your program's interface definition, including events.

## Error Handling

The producer includes robust error handling:

- Automatic reconnection on WebSocket failures
- Rate limiting detection and retry logic
- Graceful shutdown handling
- Redis connection error handling

## Monitoring

The producer logs important events:

- Transaction processing status
- WebSocket connection status
- Catch-up progress
- Kafka topic creation
- Error conditions

## Extending

To monitor multiple programs, you can extend the main `index.ts` file to create multiple watcher instances, similar to how the Python version handles tributary program.
