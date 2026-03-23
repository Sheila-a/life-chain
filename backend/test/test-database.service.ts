import { DataType, newDb } from 'pg-mem';
import { DatabaseService, RunResult } from '../src/database/database.service';

export class TestDatabaseService extends DatabaseService {
  async onModuleInit(): Promise<void> {
    const db = newDb({ autoCreateForeignKeyIndices: true });
    db.public.registerFunction({
      name: 'radians',
      args: [DataType.float],
      returns: DataType.float,
      implementation: (value: number) => (value * Math.PI) / 180
    });
    db.public.registerFunction({
      name: 'sin',
      args: [DataType.float],
      returns: DataType.float,
      implementation: (value: number) => Math.sin(value)
    });
    db.public.registerFunction({
      name: 'cos',
      args: [DataType.float],
      returns: DataType.float,
      implementation: (value: number) => Math.cos(value)
    });
    db.public.registerFunction({
      name: 'acos',
      args: [DataType.float],
      returns: DataType.float,
      implementation: (value: number) => Math.acos(value)
    });
    const adapter = db.adapters.createPg();
    const Pool = adapter.Pool;
    (this as any).pool = new Pool();
    await (this as any).initSchema();
  }

  async onModuleDestroy(): Promise<void> {
    const pool = (this as any).pool;
    if (pool) {
      await pool.end();
    }
  }

  async reset(): Promise<void> {
    await this.run('DELETE FROM bookings');
    await this.run('DELETE FROM equipment_slots');
    await this.run('DELETE FROM resource_updates');
    await this.run('DELETE FROM hospital_resources');
    await this.run('DELETE FROM vaults');
    await this.run('DELETE FROM hospitals');
    await this.run('DELETE FROM metadata');
  }

  async insertMetadata(key: string, value: string): Promise<RunResult> {
    const now = new Date().toISOString();
    return this.run(
      `
      INSERT INTO metadata (key, value, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at
      `,
      [key, value, now, now]
    );
  }
}
