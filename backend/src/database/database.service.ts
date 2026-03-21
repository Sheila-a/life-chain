import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';

export type RunResult = {
  changes: number;
  lastInsertRowid: number | null;
};

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool;

  async onModuleInit(): Promise<void> {
    this.ensureInitialized();
    await this.initSchema();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async query<T extends QueryResultRow = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    this.ensureInitialized();
    const result = await this.pool.query<T>(this.toPostgresSql(sql), params);
    return result.rows;
  }

  async run(sql: string, params: unknown[] = []): Promise<RunResult> {
    this.ensureInitialized();

    const baseSql = this.toPostgresSql(sql).trim();
    const isInsert = /^\s*insert\b/i.test(baseSql);
    const hasReturning = /\breturning\b/i.test(baseSql);
    const executableSql = isInsert && !hasReturning ? `${baseSql} RETURNING *` : baseSql;

    const result = await this.pool.query<Record<string, unknown>>(executableSql, params);
    const insertedId = this.parseInsertedId(result.rows[0]?.id);

    return {
      changes: result.rowCount ?? 0,
      lastInsertRowid: insertedId
    };
  }

  private ensureInitialized(): void {
    if (this.pool) {
      return;
    }

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required');
    }

    this.pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  private toPostgresSql(sql: string): string {
    let index = 0;
    return sql.replace(/\?/g, () => {
      index += 1;
      return `$${index}`;
    });
  }

  private parseInsertedId(value: unknown): number | null {
    if (typeof value === 'number') {
      return Number.isSafeInteger(value) ? value : null;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isSafeInteger(parsed) ? parsed : null;
    }

    return null;
  }

  private async initSchema(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      );

      CREATE TABLE IF NOT EXISTS hospitals (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        long DOUBLE PRECISION NOT NULL,
        created_at TIMESTAMPTZ NOT NULL
      );

      CREATE TABLE IF NOT EXISTS resource_updates (
        id BIGSERIAL PRIMARY KEY,
        hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
        resource_type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        timestamp TIMESTAMPTZ NOT NULL,
        hedera_tx_id TEXT,
        kms_signature TEXT,
        payload_hash TEXT,
        kms_key_id TEXT
      );

      CREATE TABLE IF NOT EXISTS hospital_resources (
        id BIGSERIAL PRIMARY KEY,
        hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
        resource_type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL,
        UNIQUE (hospital_id, resource_type)
      );

      CREATE INDEX IF NOT EXISTS idx_hospital_resources_resource_type_hospital_id
      ON hospital_resources (resource_type, hospital_id);

      CREATE INDEX IF NOT EXISTS idx_hospitals_lat_long
      ON hospitals (lat, long);

      CREATE TABLE IF NOT EXISTS equipment_slots (
        id BIGSERIAL PRIMARY KEY,
        hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
        slot_type TEXT NOT NULL,
        slot_time TIMESTAMPTZ NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id BIGSERIAL PRIMARY KEY,
        slot_id BIGINT NOT NULL REFERENCES equipment_slots(id),
        hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
        booked_at TIMESTAMPTZ NOT NULL,
        hedera_tx_id TEXT,
        kms_signature TEXT,
        payload_hash TEXT,
        kms_key_id TEXT
      );

      CREATE TABLE IF NOT EXISTS vaults (
        id BIGSERIAL PRIMARY KEY,
        hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
        encrypted_content TEXT NOT NULL,
        iv TEXT NOT NULL,
        auth_tag TEXT NOT NULL,
        key_cipher TEXT NOT NULL,
        file_hash TEXT NOT NULL,
        release_time TIMESTAMPTZ NOT NULL,
        hfs_file_id TEXT,
        hcs_tx_id TEXT,
        created_at TIMESTAMPTZ NOT NULL
      );

      ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
      ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS long DOUBLE PRECISION;
      ALTER TABLE resource_updates ADD COLUMN IF NOT EXISTS kms_signature TEXT;
      ALTER TABLE resource_updates ADD COLUMN IF NOT EXISTS payload_hash TEXT;
      ALTER TABLE resource_updates ADD COLUMN IF NOT EXISTS kms_key_id TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS kms_signature TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payload_hash TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS kms_key_id TEXT;

      INSERT INTO hospital_resources (hospital_id, resource_type, quantity, updated_at)
      SELECT DISTINCT ON (ru.hospital_id, ru.resource_type)
        ru.hospital_id,
        ru.resource_type,
        ru.quantity,
        ru.timestamp
      FROM resource_updates ru
      ORDER BY ru.hospital_id, ru.resource_type, ru.timestamp DESC, ru.id DESC
      ON CONFLICT (hospital_id, resource_type)
      DO UPDATE SET
        quantity = EXCLUDED.quantity,
        updated_at = EXCLUDED.updated_at;
    `);
  }
}
