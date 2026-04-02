const request = require('supertest');
const app = require('../src/app');
const {
  connectTestDB,
  clearDatabase,
  disconnectTestDB,
  createTestUser,
  createTestRecord,
} = require('./setup');

let adminToken, viewerToken, analystToken, adminUser;

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearDatabase();

  // Create users for each role
  const admin = await createTestUser({ email: 'admin@test.com', role: 'admin' });
  const viewer = await createTestUser({ email: 'viewer@test.com', role: 'viewer' });
  const analyst = await createTestUser({ email: 'analyst@test.com', role: 'analyst' });

  adminToken = admin.token;
  viewerToken = viewer.token;
  analystToken = analyst.token;
  adminUser = admin.user;
});

afterAll(async () => await disconnectTestDB());

describe('Financial Records Endpoints', () => {
  describe('POST /api/records', () => {
    it('should allow admin to create a record', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 5000,
          type: 'income',
          category: 'Salary',
          date: '2025-03-01',
          description: 'March salary',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.record.amount).toBe(5000);
      expect(res.body.data.record.type).toBe('income');
    });

    it('should reject viewer from creating a record', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          amount: 5000,
          type: 'income',
          category: 'Salary',
          date: '2025-03-01',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject analyst from creating a record', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          amount: 5000,
          type: 'income',
          category: 'Salary',
          date: '2025-03-01',
        });

      expect(res.status).toBe(403);
    });

    it('should reject record with missing required fields', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 5000 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject record with negative amount', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: -100,
          type: 'income',
          category: 'Salary',
          date: '2025-03-01',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/records', () => {
    beforeEach(async () => {
      // Create sample records
      await createTestRecord(adminUser._id, { type: 'income', category: 'Salary', amount: 5000 });
      await createTestRecord(adminUser._id, { type: 'expense', category: 'Rent', amount: 1500 });
      await createTestRecord(adminUser._id, { type: 'income', category: 'Freelance', amount: 2000 });
    });

    it('should allow all roles to list records', async () => {
      for (const token of [adminToken, analystToken, viewerToken]) {
        const res = await request(app)
          .get('/api/records')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(3);
        expect(res.body.pagination).toBeDefined();
      }
    });

    it('should filter records by type', async () => {
      const res = await request(app)
        .get('/api/records?type=income')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      res.body.data.forEach((record) => {
        expect(record.type).toBe('income');
      });
    });

    it('should filter records by category', async () => {
      const res = await request(app)
        .get('/api/records?category=Rent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].category).toBe('Rent');
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/records?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.totalRecords).toBe(3);
      expect(res.body.pagination.totalPages).toBe(2);
    });
  });

  describe('PUT /api/records/:id', () => {
    it('should allow admin to update a record', async () => {
      const record = await createTestRecord(adminUser._id);

      const res = await request(app)
        .put(`/api/records/${record._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 9999, category: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body.data.record.amount).toBe(9999);
      expect(res.body.data.record.category).toBe('Updated');
    });

    it('should reject viewer from updating a record', async () => {
      const record = await createTestRecord(adminUser._id);

      const res = await request(app)
        .put(`/api/records/${record._id}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ amount: 9999 });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/records/:id', () => {
    it('should soft-delete a record (admin only)', async () => {
      const record = await createTestRecord(adminUser._id);

      const res = await request(app)
        .delete(`/api/records/${record._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      // Record should not appear in normal listings
      const listRes = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listRes.body.data.length).toBe(0);
    });

    it('should reject viewer from deleting a record', async () => {
      const record = await createTestRecord(adminUser._id);

      const res = await request(app)
        .delete(`/api/records/${record._id}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });
});
