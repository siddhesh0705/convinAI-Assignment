const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

describe('User API', () => {
  beforeEach(async () => {
    await User.destroy({ where: {} });
  });

  describe('POST /api/users', () => {
    const validUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      mobileNumber: '1234567890'
    };

    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/users')
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe(validUser.email);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should not create user with invalid email', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          ...validUser,
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
    });

    it('should not create duplicate user', async () => {
      await request(app)
        .post('/api/users')
        .send(validUser);

      const response = await request(app)
        .post('/api/users')
        .send(validUser);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Email already registered');
    });

    it('should hash the password', async () => {
      const response = await request(app)
        .post('/api/users')
        .send(validUser);

      const user = await User.findOne({ where: { email: validUser.email } });
      const isMatch = await bcrypt.compare(validUser.password, user.password);
      expect(isMatch).toBe(true);
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          mobileNumber: '1234567890'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should not login with wrong password', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/users/:id', () => {
    let token;
    let userId;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          mobileNumber: '1234567890'
        });

      token = createResponse.body.token;
      userId = createResponse.body.user.id;
    });

    it('should get user details with valid token', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.password).toBeUndefined();
    });

    it('should not get user details without token', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`);

      expect(response.status).toBe(401);
    });

    it('should not get non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/nonexistentid')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});