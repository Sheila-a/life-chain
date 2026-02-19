import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SqliteService } from '../database/sqlite.service';

@Injectable()
export class AuthService {
  constructor(private readonly db: SqliteService) {}

  async registerHospital(payload: { name?: string; email?: string; password?: string }) {
    const { name, email, password } = payload;
    if (!name || !email || !password) {
      throw new BadRequestException('name, email, and password are required');
    }

    const existing = this.db.query('SELECT id FROM hospitals WHERE email = ? LIMIT 1', [email])[0];
    if (existing) {
      throw new ConflictException('Hospital with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();
    const result = this.db.run(
      'INSERT INTO hospitals (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, createdAt]
    );

    return {
      id: Number(result.lastInsertRowid),
      name,
      email,
      createdAt
    };
  }

  async login(payload: { email?: string; password?: string }) {
    const { email, password } = payload;
    if (!email || !password) {
      throw new BadRequestException('email and password are required');
    }

    const hospital = this.db.query<{
      id: number;
      email: string;
      password_hash: string;
    }>('SELECT id, email, password_hash FROM hospitals WHERE email = ? LIMIT 1', [email])[0];

    if (!hospital) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, hospital.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = jwt.sign(
      { hospitalId: hospital.id, email: hospital.email },
      process.env.JWT_SECRET ?? 'change-me',
      { expiresIn: '8h' }
    );

    return { token };
  }
}
