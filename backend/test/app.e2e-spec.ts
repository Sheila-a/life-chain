import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { HederaService } from '../src/hedera/hedera.service';
import { MockHederaService } from './mock-hedera.service';
import { TestDatabaseService } from './test-database.service';

describe('LifeChain Phase 2 API', () => {
  let app: INestApplication;
  let db: TestDatabaseService;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.VAULT_MASTER_KEY = 'test-master-key-12345678901234567890';
    process.env.HEDERA_NETWORK = 'testnet';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(DatabaseService)
      .useClass(TestDatabaseService)
      .overrideProvider(HederaService)
      .useClass(MockHederaService)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    db = app.get(DatabaseService) as TestDatabaseService;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await db.reset();
  });

  it('registers, logs in, creates a resource update, patches quantity, and exposes resource audit', async () => {
    const hospital = await registerHospital(app, 'City General', 'city@example.org', 6.5244, 3.3792);
    const token = await loginHospital(app, 'city@example.org');

    const createResponse = await request(app.getHttpServer())
      .post('/api/resource-updates')
      .set('Authorization', `Bearer ${token}`)
      .send({
        resourceType: 'AntiVenom',
        quantity: 3
      })
      .expect(201);

    expect(createResponse.body.id).toBeGreaterThan(0);
    expect(createResponse.body.hederaTopicId).toBe('0.0.7001');
    expect(createResponse.body.hederaTxId).toContain('0.0.7002@');

    const patchResponse = await request(app.getHttpServer())
      .patch('/api/resources/AntiVenom')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 5 })
      .expect(200);

    expect(patchResponse.body.quantity).toBe(5);

    const auditResponse = await request(app.getHttpServer())
      .get(`/api/audit/resources/${createResponse.body.id}`)
      .expect(200);

    expect(auditResponse.body).toMatchObject({
      id: createResponse.body.id,
      type: 'resource',
      hospitalId: hospital.id,
      resourceType: 'AntiVenom',
      quantity: 3,
      hederaTopicId: '0.0.7001',
      auditStatus: 'verified-stored'
    });
    expect(auditResponse.body.hashscanTopicUrl).toBe('https://hashscan.io/testnet/topic/0.0.7001');
    expect(auditResponse.body.hashscanTransactionUrl).toContain('https://hashscan.io/testnet/transaction/');
  });

  it('returns nearest resources ordered by distance and then quantity, excluding zero stock', async () => {
    const city = await registerHospital(app, 'City General', 'city@example.org', 6.5244, 3.3792);
    const near = await registerHospital(app, 'Near Clinic', 'near@example.org', 6.5244, 3.3792);
    const far = await registerHospital(app, 'Far Hospital', 'far@example.org', 7.2, 3.9);
    const zero = await registerHospital(app, 'Zero Stock', 'zero@example.org', 6.525, 3.38);

    const cityToken = await loginHospital(app, 'city@example.org');
    const nearToken = await loginHospital(app, 'near@example.org');
    const farToken = await loginHospital(app, 'far@example.org');
    const zeroToken = await loginHospital(app, 'zero@example.org');

    await createResource(app, cityToken, 'MRI', 4);
    await createResource(app, nearToken, 'MRI', 10);
    await createResource(app, farToken, 'MRI', 8);
    await createResource(app, zeroToken, 'MRI', 1);
    await request(app.getHttpServer())
      .patch('/api/resources/MRI')
      .set('Authorization', `Bearer ${zeroToken}`)
      .send({ quantity: 0 })
      .expect(200);

    const nearestResponse = await request(app.getHttpServer())
      .get('/api/resources/nearest')
      .query({
        resourceType: 'MRI',
        lat: '6.5244',
        long: '3.3792',
        radiusKm: '200',
        limit: '10'
      })
      .expect(200);

    expect(nearestResponse.body).toHaveLength(3);
    expect(nearestResponse.body[0]).toMatchObject({ hospitalId: near.id, hospitalName: 'Near Clinic' });
    expect(nearestResponse.body.map((row: { hospitalId: number }) => row.hospitalId)).toEqual(
      expect.arrayContaining([city.id, near.id, far.id])
    );
    expect(nearestResponse.body.every((row: { quantity: number }) => row.quantity > 0)).toBe(true);

    const limitedResponse = await request(app.getHttpServer())
      .get('/api/resources/nearest')
      .query({
        resourceType: 'MRI',
        lat: '6.5244',
        long: '3.3792',
        radiusKm: '200',
        limit: '1'
      })
      .expect(200);

    expect(limitedResponse.body).toHaveLength(1);
    expect(limitedResponse.body[0]).toMatchObject({ hospitalId: near.id, hospitalName: 'Near Clinic' });

    await request(app.getHttpServer())
      .get('/api/resources/nearest')
      .query({ resourceType: 'MRI' })
      .expect(400);
  });

  it('creates equipment, books it, and exposes booking audit data', async () => {
    await registerHospital(app, 'Owner Hospital', 'owner@example.org', 6.5, 3.3);
    await registerHospital(app, 'Booking Hospital', 'booker@example.org', 6.7, 3.4);
    const ownerToken = await loginHospital(app, 'owner@example.org');
    const bookerToken = await loginHospital(app, 'booker@example.org');

    const slotResponse = await request(app.getHttpServer())
      .post('/api/equipment/create')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        slotType: 'MRI',
        slotTime: '2026-04-01T10:00:00.000Z'
      })
      .expect(201);

    const listResponse = await request(app.getHttpServer())
      .get('/api/equipment/list')
      .query({ onlyAvailable: 'true' })
      .expect(200);

    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].id).toBe(slotResponse.body.id);

    const bookingResponse = await request(app.getHttpServer())
      .post('/api/booking/create')
      .set('Authorization', `Bearer ${bookerToken}`)
      .send({ slotId: slotResponse.body.id })
      .expect(201);

    expect(bookingResponse.body.hederaTxId).toContain('0.0.7002@');

    const auditResponse = await request(app.getHttpServer())
      .get(`/api/audit/bookings/${bookingResponse.body.id}`)
      .expect(200);

    expect(auditResponse.body).toMatchObject({
      id: bookingResponse.body.id,
      type: 'booking',
      slotId: slotResponse.body.id,
      auditStatus: 'verified-stored'
    });

    await request(app.getHttpServer()).get('/api/audit/bookings/9999').expect(404);
  });

  it('uploads vaults, blocks early release, allows late release, and exposes vault audit data', async () => {
    const hospital = await registerHospital(app, 'Vault Hospital', 'vault@example.org', 6.4, 3.2);
    const token = await loginHospital(app, 'vault@example.org');

    const futureVault = await request(app.getHttpServer())
      .post('/api/vault/upload')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Patient has severe allergy.',
        releaseTime: '2099-12-31T23:59:59.000Z'
      })
      .expect(201);

    expect(futureVault.body.hfsFileId).toContain('0.0.');

    await request(app.getHttpServer())
      .get(`/api/vault/release/${futureVault.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    const releasableVault = await request(app.getHttpServer())
      .post('/api/vault/upload')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Release-approved content.',
        releaseTime: '2020-01-01T00:00:00.000Z'
      })
      .expect(201);

    const releaseResponse = await request(app.getHttpServer())
      .get(`/api/vault/release/${releasableVault.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(releaseResponse.body).toMatchObject({
      id: releasableVault.body.id,
      hospitalId: hospital.id,
      content: 'Release-approved content.'
    });

    const auditResponse = await request(app.getHttpServer())
      .get(`/api/audit/vaults/${futureVault.body.id}`)
      .expect(200);

    expect(auditResponse.body).toMatchObject({
      id: futureVault.body.id,
      type: 'vault',
      hospitalId: hospital.id,
      auditStatus: 'verified-stored'
    });
    expect(auditResponse.body.hashscanFileUrl).toContain('https://hashscan.io/testnet/file/');
    expect(auditResponse.body.hashscanTransactionUrl).toContain('https://hashscan.io/testnet/transaction/');

    await request(app.getHttpServer()).get('/api/audit/vaults/9999').expect(404);
  });
});

async function registerHospital(
  app: INestApplication,
  name: string,
  email: string,
  lat: number,
  long: number
) {
  const response = await request(app.getHttpServer())
    .post('/api/register-hospital')
    .send({
      name,
      email,
      password: 'StrongPass123!',
      lat,
      long
    })
    .expect(201);

  return response.body as { id: number };
}

async function loginHospital(app: INestApplication, email: string) {
  const response = await request(app.getHttpServer())
    .post('/api/login')
    .send({
      email,
      password: 'StrongPass123!'
    })
    .expect(201);

  return response.body.token as string;
}

async function createResource(app: INestApplication, token: string, resourceType: string, quantity: number) {
  return request(app.getHttpServer())
    .post('/api/resource-updates')
    .set('Authorization', `Bearer ${token}`)
    .send({ resourceType, quantity })
    .expect(201);
}
