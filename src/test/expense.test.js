const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Expense = require('../models/Expense');
const ExpenseShare = require('../models/expenseShare');

describe('Expense API', () => {
  let token;
  let user;
  let friend1;
  let friend2;

  beforeEach(async () => {
    await User.destroy({ where: {} });
    await Expense.destroy({ where: {} });
    await ExpenseShare.destroy({ where: {} });

    // Create main user
    const userResponse = await request(app)
      .post('/api/users')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        mobileNumber: '1234567890'
      });

    // Create friend1
    const friend1Response = await request(app)
      .post('/api/users')
      .send({
        name: 'Friend 1',
        email: 'friend1@example.com',
        password: 'password123',
        mobileNumber: '1234567891'
      });

    // Create friend2
    const friend2Response = await request(app)
      .post('/api/users')
      .send({
        name: 'Friend 2',
        email: 'friend2@example.com',
        password: 'password123',
        mobileNumber: '1234567892'
      });

    token = userResponse.body.token;
    user = userResponse.body.user;
    friend1 = friend1Response.body.user;
    friend2 = friend2Response.body.user;
  });

  describe('POST /api/expenses', () => {
    it('should create expense with equal split', async () => {
      const expense = {
        description: 'Dinner',
        amount: 3000,
        splitType: 'EQUAL',
        shares: [
          { userId: user.id },
          { userId: friend1.id },
          { userId: friend2.id }
        ]
      };

      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send(expense);

      expect(response.status).toBe(201);
      expect(response.body.expense.amount).toBe('3000.00');
      expect(response.body.shares).toHaveLength(3);
      expect(response.body.shares[0].share).toBe('1000.00');
    });

    it('should create expense with exact split', async () => {
      const expense = {
        description: 'Shopping',
        amount: 4299,
        splitType: 'EXACT',
        shares: [
          { userId: user.id, share: 1500 },
          { userId: friend1.id, share: 799 },
          { userId: friend2.id, share: 2000 }
        ]
      };

      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send(expense);

      expect(response.status).toBe(201);
      expect(response.body.expense.amount).toBe('4299.00');
      expect(response.body.shares).toHaveLength(3);
    });

    it('should create expense with percentage split', async () => {
      const expense = {
        description: 'Party',
        amount: 1000,
        splitType: 'PERCENTAGE',
        shares: [
          { userId: user.id, percentage: 50 },
          { userId: friend1.id, percentage: 25 },
          { userId: friend2.id, percentage: 25 }
        ]
      };

      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send(expense);

      expect(response.status).toBe(201);
      expect(response.body.shares).toHaveLength(3);
      expect(response.body.shares.find(s => s.userId === user.id).share).toBe('500.00');
    });

    it('should validate total percentage equals 100', async () => {
      const expense = {
        description: 'Party',
        amount: 1000,
        splitType: 'PERCENTAGE',
        shares: [
          { userId: user.id, percentage: 50 },
          { userId: friend1.id, percentage: 20 },
          { userId: friend2.id, percentage: 20 }
        ]
      };

      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send(expense);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Percentages must add up to 100');
    });
  });

  describe('GET /api/expenses', () => {
    beforeEach(async () => {
      // Create test expense
      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Test Expense',
          amount: 3000,
          splitType: 'EQUAL',
          shares: [
            { userId: user.id },
            { userId: friend1.id },
            { userId: friend2.id }
          ]
        });
    });

    it('should get all expenses', async () => {
      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].description).toBe('Test Expense');
    });

    it('should get user expenses', async () => {
      const response = await request(app)
        .get(`/api/expenses/user/${user.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].share).toBe('1000.00');
    });
  });

  describe('GET /api/expenses/balance-sheet', () => {
    beforeEach(async () => {
      // Create multiple test expenses
      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Expense 1',
          amount: 3000,
          splitType: 'EQUAL',
          shares: [
            { userId: user.id },
            { userId: friend1.id },
            { userId: friend2.id }
          ]
        });

      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Expense 2',
          amount: 1500,
          splitType: 'PERCENTAGE',
          shares: [
            { userId: user.id, percentage: 50 },
            { userId: friend1.id, percentage: 25 },
            { userId: friend2.id, percentage: 25 }
          ]
        });
    });

    it('should generate balance sheet', async () => {
      const response = await request(app)
        .get('/api/expenses/balance-sheet')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
    });
  });
});