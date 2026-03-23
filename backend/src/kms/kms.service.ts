import { Injectable } from '@nestjs/common';
import { KMSClient, SignCommand, SigningAlgorithmSpec } from '@aws-sdk/client-kms';
import * as crypto from 'crypto';

type SignablePayload = Record<string, unknown>;

export type SignedPayloadResult = {
  signature: string;
  payloadHash: string;
  kmsKeyId: string;
  mode: 'live' | 'mock';
};

@Injectable()
export class KmsService {
  private readonly kmsKeyId = process.env.AWS_KMS_KEY_ID ?? 'mock-kms-key';
  private readonly signingAlgorithm = (process.env.AWS_KMS_SIGNING_ALGORITHM ??
    SigningAlgorithmSpec.ECDSA_SHA_256) as SigningAlgorithmSpec;
  private readonly enabled: boolean;
  private readonly client: KMSClient | null;

  constructor() {
    this.enabled = Boolean(
      process.env.AWS_REGION &&
        process.env.AWS_KMS_KEY_ID &&
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY
    );

    this.client = this.enabled
      ? new KMSClient({
          region: process.env.AWS_REGION
        })
      : null;
  }

  async signPayload(payload: SignablePayload): Promise<SignedPayloadResult> {
    const canonicalPayload = JSON.stringify(payload);
    const payloadHash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');

    if (!this.enabled || !this.client) {
      const signature = crypto.createHash('sha256').update(`mock-kms:${canonicalPayload}`).digest('base64');
      return {
        signature,
        payloadHash,
        kmsKeyId: this.kmsKeyId,
        mode: 'mock'
      };
    }

    const digest = crypto.createHash('sha256').update(canonicalPayload).digest();
    const response = await this.client.send(
      new SignCommand({
        KeyId: this.kmsKeyId,
        Message: digest,
        MessageType: 'DIGEST',
        SigningAlgorithm: this.signingAlgorithm
      })
    );

    return {
      signature: Buffer.from(response.Signature ?? []).toString('base64'),
      payloadHash,
      kmsKeyId: this.kmsKeyId,
      mode: 'live'
    };
  }

  async signHash(hash: string): Promise<SignedPayloadResult> {
    if (!hash || !/^[a-fA-F0-9]{64}$/.test(hash)) {
      throw new Error('hash must be a valid SHA-256 hex digest');
    }

    if (!this.enabled || !this.client) {
      const signature = crypto.createHash('sha256').update(`mock-kms-hash:${hash}`).digest('base64');
      return {
        signature,
        payloadHash: hash.toLowerCase(),
        kmsKeyId: this.kmsKeyId,
        mode: 'mock'
      };
    }

    const digest = Buffer.from(hash, 'hex');
    const response = await this.client.send(
      new SignCommand({
        KeyId: this.kmsKeyId,
        Message: digest,
        MessageType: 'DIGEST',
        SigningAlgorithm: this.signingAlgorithm
      })
    );

    return {
      signature: Buffer.from(response.Signature ?? []).toString('base64'),
      payloadHash: hash.toLowerCase(),
      kmsKeyId: this.kmsKeyId,
      mode: 'live'
    };
  }
}
