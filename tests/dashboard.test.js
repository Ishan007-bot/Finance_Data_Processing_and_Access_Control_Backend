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

  const admin = await createTestUser({ email: 'admin@test.com', role: 'admin' });
  const viewer = await createTestUser({ email: 'viewer@test.com', role: 'viewer' });
  const analyst = await createTestUser({ email: 'analyst@test.com', role: 'analyst' });

  adminToken = admin.token;
  viewerToken = viewer.token;
  analystToken = analyst.token;
  adminUser = admin.user;

  // Seed some records for dashboard tests
  await createTestRecord(adminUser._id, { type: 'income', category: 'Salary', amount: 5000, date: new Date('2025-03-01') });
  await createTestRecord(adminUser._id, { type: 'income', category: 'Freelance', amount: 2000, date: new Date('2025-03-15') });
  await createTestRecord(adminUser._id, { type: 'expense', category: 'Rent', amount: 1500, date: new Date('2025-03-05') });
  await createTestRecord(adminUser._id, { type: 'expense', category: 'Groceries', amount: 300, date: new Date('2025-02-10') });
});

afterAll(async () => await disconnectTestDB());

describe('Dashboard Endpoints', () => {
  describe('GET /api/dashboard/summary', () => {
    it('should return correct totals for admin', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.totalIncome).toBe(7000);
      expect(res.body.data.summary.totalExpenses).toBe(1800);
      expect(res.body.data.summary.netBalance).toBe(5200);
      expect(res.body.data.summary.totalRecords).toBe(4);
    });

    it('should allow analyst to access summary', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should deny viewer access to summary', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/dashboard/category-totals', () => {
    it('should return category-wise breakdown', async () => {
      const res = await request(app)
        .get('/api/dashboard/category-totals')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.categoryTotals).toBeInstanceOf(Array);
      expect(res.body.data.categoryTotals.length).toBeGreaterThan(0);

      // Each entry should have category, type, total, and count
      res.body.data.categoryTotals.forEach((item) => {
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('total');
        expect(item).toHaveProperty('count');
      });
    });

    it('should deny viewer access', async () => {
      const res = await request(app)
        .get('/api/dashboard/category-totals')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/dashboard/trends', () => {
    it('should return monthly trends', async () => {
      const res = await request(app)
        .get('/api/dashboard/trends')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.trends).toBeInstanceOf(Array);

      res.body.data.trends.forEach((item) => {
        expect(item).toHaveProperty('year');
        expect(item).toHaveProperty('month');
        expect(item).toHaveProperty('income');
        expect(item).toHaveProperty('expenses');
        expect(item).toHaveProperty('net');
      });
    });
  });

  describe('GET /api/dashboard/recent-activity', () => {
    it('should return recent records', async () => {
      const res = await request(app)
        .get('/api/dashboard/recent-activity')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.recentActivity).toBeInstanceOf(Array);
      expect(res.body.data.recentActivity.length).toBe(4);
    });

    it('should respect limit parameter', async () => {
      const res = await request(app)
        .get('/api/dashboard/recent-activity?limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.recentActivity.length).toBe(2);
    });

    it('should deny viewer access', async () => {
      const res = await request(app)
        .get('/api/dashboard/recent-activity')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });
});
