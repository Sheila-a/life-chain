import { Injectable, OnModuleInit } from '@nestjs/common';
import type BetterSqlite3 from 'better-sqlite3';
const Database = require('better-sqlite3') as typeof import('better-sqlite3');

@Injectable()
export class SqliteService implements OnModuleInit {
  private db!: BetterSqlite3.Database;

  onModuleInit(): void {
    this.ensureInitialized();
  }

  query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
    this.ensureInitialized();
    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as T[];
  }

  run(sql: string, params: unknown[] = []): BetterSqlite3.RunResult {
    this.ensureInitialized();
    const stmt = this.db.prepare(sql);
    return stmt.run(...params);
  }

  private ensureInitialized(): void {
    if (this.db) {
      return;
    }

    const path = process.env.SQLITE_PATH ?? './lifechain.db';
    this.db = new Database(path);
    this.db.pragma('journal_mode = WAL');
    this.initSchema();
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS hospitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS resource_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hospital_id INTEGER NOT NULL,
        resource_type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        hedera_tx_id TEXT,
        FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
      );

      CREATE TABLE IF NOT EXISTS equipment_slots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hospital_id INTEGER NOT NULL,
        slot_type TEXT NOT NULL,
        slot_time TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slot_id INTEGER NOT NULL,
        hospital_id INTEGER NOT NULL,
        booked_at TEXT NOT NULL,
        hedera_tx_id TEXT,
        FOREIGN KEY (slot_id) REFERENCES equipment_slots(id),
        FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
      );

      CREATE TABLE IF NOT EXISTS vaults (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hospital_id INTEGER NOT NULL,
        encrypted_content TEXT NOT NULL,
        iv TEXT NOT NULL,
        auth_tag TEXT NOT NULL,
        key_cipher TEXT NOT NULL,
        file_hash TEXT NOT NULL,
        release_time TEXT NOT NULL,
        hfs_file_id TEXT,
        hcs_tx_id TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
      );
    `);
  }
}
