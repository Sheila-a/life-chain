export class MockHederaService {
  private txCounter = 1000;
  private fileCounter = 5000;
  private readonly topicId = '0.0.7001';
  private readonly networkBase = 'https://hashscan.io/testnet';

  async init(): Promise<void> {
    return Promise.resolve();
  }

  async submitConsensusMessage(): Promise<{ txId: string; topicId: string }> {
    this.txCounter += 1;
    return {
      txId: `0.0.7002@${this.txCounter}.000000001`,
      topicId: this.topicId
    };
  }

  async uploadHashToFileService(): Promise<{ txId: string; fileId: string }> {
    this.fileCounter += 1;
    this.txCounter += 1;
    return {
      txId: `0.0.7002@${this.txCounter}.000000001`,
      fileId: `0.0.${this.fileCounter}`
    };
  }

  async getStoredTopicId(): Promise<string> {
    return this.topicId;
  }

  getHashscanTopicUrl(topicId: string | null): string | null {
    return topicId ? `${this.networkBase}/topic/${topicId}` : null;
  }

  getHashscanTransactionUrl(transactionId: string | null): string | null {
    return transactionId ? `${this.networkBase}/transaction/${encodeURIComponent(transactionId)}` : null;
  }

  getHashscanFileUrl(fileId: string | null): string | null {
    return fileId ? `${this.networkBase}/file/${fileId}` : null;
  }
}
