import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly masterKey: Buffer;

  constructor() {
    this.masterKey = crypto
      .createHash('sha256')
      .update(process.env.VAULT_MASTER_KEY ?? 'insecure-default-master-key')
      .digest();
  }

  generateDataKey(): Buffer {
    return crypto.randomBytes(32);
  }

  encryptWithAesGcm(content: string, key: Buffer): { encryptedContent: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(content, 'utf8'), cipher.final()]);

    return {
      encryptedContent: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      authTag: cipher.getAuthTag().toString('base64')
    };
  }

  decryptWithAesGcm(payload: { encryptedContent: string; iv: string; authTag: string }, key: Buffer): string {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payload.encryptedContent, 'base64')),
      decipher.final()
    ]);
    return decrypted.toString('utf8');
  }

  wrapDataKey(key: Buffer): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, iv);
    const encrypted = Buffer.concat([cipher.update(key), cipher.final()]);

    return JSON.stringify({
      k: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      t: cipher.getAuthTag().toString('base64')
    });
  }

  unwrapDataKey(keyCipher: string): Buffer {
    const parsed = JSON.parse(keyCipher) as { k: string; iv: string; t: string };
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.masterKey, Buffer.from(parsed.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(parsed.t, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(parsed.k, 'base64')), decipher.final()]);
  }

  sha256(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
  }
}
