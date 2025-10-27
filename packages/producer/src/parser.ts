import { EventParser, Event } from "@coral-xyz/anchor";
import { type Program } from "@tributary-so/sdk";

export class ChainscopeParser {
  private program!: Program;
  private parser!: EventParser;

  constructor(program: Program) {
    this.program = program;
  }

  async initialize(): Promise<void> {
    const coder = this.program.coder;
    this.parser = new EventParser(this.program.programId, coder);
  }

  async parseTransaction(
    tx: any, // ConfirmedSignatureInfo doesn't have the full transaction data we need
    signature: string,
  ): Promise<any> {
    // For now, we'll need to fetch the full transaction
    // This is a simplified version - in practice you'd need to get the full transaction with logs
    const connection = this.program.provider.connection;
    const txInfo = await connection.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    if (!txInfo || !txInfo.meta || txInfo.meta.err) {
      return { error: "Transaction failed" };
    }

    const logs = txInfo.meta.logMessages;
    if (!logs) {
      return { error: "No logs found" };
    }

    const parsedEvents: Event[] = [];
    const generator = this.parser.parseLogs(logs);
    for (const event of generator) {
      parsedEvents.push(event);
    }

    return {
      signature,
      slot: txInfo.slot,
      blockTime: txInfo.blockTime,
      events: parsedEvents,
      transaction: txInfo,
    };
  }
}
