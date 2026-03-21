import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  async registerHospital(payload: { name?: string; email?: string; password?: string; lat?: number; long?: number }) {
    const { name, email, password, lat, long } = payload;
    if (!name || !email || !password || lat === undefined || long === undefined) {
      throw new BadRequestException('name, email, password, lat, and long are required');
    }

    const latitude = Number(lat);
    const longitude = Number(long);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      throw new BadRequestException('lat and long must be valid numbers');
    }

    const existing = (await this.db.query('SELECT id FROM hospitals WHERE email = ? LIMIT 1', [email]))[0];
    if (existing) {
      throw new ConflictException('Hospital with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();
    const result = await this.db.run(
      'INSERT INTO hospitals (name, email, password_hash, lat, long, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, latitude, longitude, createdAt]
    );

    return {
      id: Number(result.lastInsertRowid),
      name,
      email,
      lat: latitude,
      long: longitude,
      createdAt
    };
  }

  async login(payload: { email?: string; password?: string }) {
    const { email, password } = payload;
    if (!email || !password) {
      throw new BadRequestException('email and password are required');
    }

    const hospital = (await this.db.query<{
      id: number;
      email: string;
      password_hash: string;
    }>('SELECT id, email, password_hash FROM hospitals WHERE email = ? LIMIT 1', [email]))[0];

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

  async getMyProfile(user?: { hospitalId: number }) {
    const hospitalId = Number(user?.hospitalId);
    if (!hospitalId) {
      throw new UnauthorizedException('Authenticated hospital context is required');
    }

    const hospital = await this.getHospitalById(hospitalId);
    if (!hospital) {
      throw new UnauthorizedException('Hospital account not found');
    }

    return this.toHospitalProfile(hospital);
  }

  async updateMyLocation(
    payload: { lat?: number; long?: number },
    user?: { hospitalId: number }
  ) {
    const hospitalId = Number(user?.hospitalId);
    if (!hospitalId) {
      throw new UnauthorizedException('Authenticated hospital context is required');
    }

    const latitude = Number(payload.lat);
    const longitude = Number(payload.long);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      throw new BadRequestException('lat and long must be valid numbers');
    }

    await this.db.run('UPDATE hospitals SET lat = ?, long = ? WHERE id = ?', [
      latitude,
      longitude,
      hospitalId
    ]);

    const hospital = await this.getHospitalById(hospitalId);

    if (!hospital) {
      throw new UnauthorizedException('Hospital account not found');
    }

    return this.toHospitalProfile(hospital);
  }

  private async getHospitalById(hospitalId: number) {
    return (
      await this.db.query<{
        id: number;
        name: string;
        email: string;
        lat: number;
        long: number;
        created_at: string;
      }>('SELECT id, name, email, lat, long, created_at FROM hospitals WHERE id = ? LIMIT 1', [
        hospitalId
      ])
    )[0];
  }

  private toHospitalProfile(hospital: {
    id: number;
    name: string;
    email: string;
    lat: number;
    long: number;
    created_at: string;
  }) {
    return {
      id: Number(hospital.id),
      name: hospital.name,
      email: hospital.email,
      lat: Number(hospital.lat),
      long: Number(hospital.long),
      createdAt: hospital.created_at
    };
  }
}
