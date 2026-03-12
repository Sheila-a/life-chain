import { Injectable } from '@nestjs/common';
import {
  Client,
  FileId,
  FileCreateTransaction,
  TopicId,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction
} from '@hashgraph/sdk';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class HederaService {
  private readonly hashscanBaseUrls = {
    mainnet: 'https://hashscan.io/mainnet',
    testnet: 'https://hashscan.io/testnet'
  } as const;
  private client: Client | null = null;
  private topicId = '';
  private enabled = false;

  constructor(private readonly db: DatabaseService) {}

  async init(): Promise<void> {
    const operatorId = process.env.HEDERA_OPERATOR_ID;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY;
    const network = (process.env.HEDERA_NETWORK ?? 'testnet').toLowerCase();

    this.enabled = Boolean(operatorId && operatorKey);

    if (this.enabled) {
      this.client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
      this.client.setOperator(operatorId as string, operatorKey as string);
    }

    this.topicId = await this.resolveTopicId();
    console.log(`Hedera mode: ${this.enabled ? 'live' : 'mock'}, topic: ${this.topicId}`);
  }

  async submitConsensusMessage(payload: Record<string, unknown>): Promise<{ txId: string; topicId: string }> {
    if (!this.enabled || !this.client) {
      return { txId: `mock-hcs-${Date.now()}`, topicId: this.topicId };
    }

    const tx = await new TopicMessageSubmitTransaction()
      .setTopicId(this.topicId)
      .setMessage(JSON.stringify(payload))
      .execute(this.client);

    return { txId: tx.transactionId.toString(), topicId: this.topicId };
  }

  async uploadHashToFileService(
    fileHash: string,
    metadata: Record<string, unknown>
  ): Promise<{ txId: string; fileId: string }> {
    if (!this.enabled || !this.client) {
      return {
        txId: `mock-hfs-${Date.now()}`,
        fileId: `mock-file-${Date.now()}`
      };
    }

    const contents = JSON.stringify({ fileHash, ...metadata });
    const tx = await new FileCreateTransaction().setContents(contents).execute(this.client);
    const receipt = await tx.getReceipt(this.client);

    return {
      txId: tx.transactionId.toString(),
      fileId: receipt.fileId!.toString()
    };
  }

  async getStoredTopicId(): Promise<string | null> {
    if (this.topicId) {
      return this.topicId;
    }

    const row = (
      await this.db.query<{ value: string }>('SELECT value FROM metadata WHERE key = ? LIMIT 1', ['hcs_topic_id'])
    )[0];

    return row?.value ?? null;
  }

  getHashscanTopicUrl(topicId: string | null): string | null {
    if (!topicId || !this.isValidTopicId(topicId)) {
      return null;
    }

    return `${this.getHashscanBaseUrl()}/topic/${topicId}`;
  }

  getHashscanTransactionUrl(transactionId: string | null): string | null {
    if (!transactionId) {
      return null;
    }

    return `${this.getHashscanBaseUrl()}/transaction/${encodeURIComponent(transactionId)}`;
  }

  getHashscanFileUrl(fileId: string | null): string | null {
    if (!fileId || !this.isValidFileId(fileId)) {
      return null;
    }

    return `${this.getHashscanBaseUrl()}/file/${fileId}`;
  }

  private async resolveTopicId(): Promise<string> {
    const explicit = process.env.HEDERA_HCS_TOPIC_ID;
    if (explicit) {
      if (!this.isValidTopicId(explicit)) {
        throw new Error(`HEDERA_HCS_TOPIC_ID is not a valid Hedera topic id: ${explicit}`);
      }
      await this.setMetadata('hcs_topic_id', explicit);
      return explicit;
    }

    const row = (await this.db.query<{ value: string }>('SELECT value FROM metadata WHERE key = ? LIMIT 1', ['hcs_topic_id']))[0];
    if (row?.value && (!this.enabled || this.isValidTopicId(row.value))) {
      return row.value;
    }

    if (!this.enabled || !this.client) {
      const mockTopicId = `mock-topic-${Date.now()}`;
      await this.setMetadata('hcs_topic_id', mockTopicId);
      return mockTopicId;
    }

    const tx = await new TopicCreateTransaction().execute(this.client);
    const receipt = await tx.getReceipt(this.client);
    const topicId = receipt.topicId!.toString();
    await this.setMetadata('hcs_topic_id', topicId);
    return topicId;
  }

  private getHashscanBaseUrl(): string {
    const network = (process.env.HEDERA_NETWORK ?? 'testnet').toLowerCase() === 'mainnet' ? 'mainnet' : 'testnet';
    return this.hashscanBaseUrls[network];
  }

  private isValidTopicId(value: string): boolean {
    try {
      TopicId.fromString(value);
      return true;
    } catch {
      return false;
    }
  }

  private isValidFileId(value: string): boolean {
    try {
      FileId.fromString(value);
      return true;
    } catch {
      return false;
    }
  }

  private async setMetadata(key: string, value: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db.run(
      `
      INSERT INTO metadata (key, value, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at
      `,
      [key, value, now, now]
    );
  }
}
