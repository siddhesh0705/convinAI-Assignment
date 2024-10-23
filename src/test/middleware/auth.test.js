const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

describe('Auth Middleware', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      mobileNumber: '1234567890'
    });
    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
  });

  it('should authenticate valid token', async () => {
    const req = {
      header: jest.fn().mockReturnValue(`Bearer ${token}`)
    };
    const res = {};
    const next = jest.fn();

    await auth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(user.id);
  });

  it('should reject invalid token', async () => {
    const req = {
      header: jest.fn().mockReturnValue('Bearer invalid-token')
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await auth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
