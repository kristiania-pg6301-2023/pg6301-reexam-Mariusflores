import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import session from 'express-session';
import passport from 'passport';
import authRouter from '../routes/authRoutes.js'; // Adjust path if needed
import * as userApi from '../apis/userApi.js';

// Mock Express app with session & passport
const app = express();
app.use(express.json());
app.use(
  session({
    secret: 'testSecret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use('/', authRouter);

// Mock User API Functions
vi.spyOn(userApi, 'getUserById');
vi.spyOn(userApi, 'getUserByUsername');
vi.spyOn(userApi, 'createUser');
vi.spyOn(bcrypt, 'hash');
vi.spyOn(passport, 'authenticate');

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset all mocks before each test
  });

  describe('POST /register', () => {
    it('should return 400 if username is not specified', async () => {
      const response = await request(app).post('/register').send({ password: 'testPassword' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username and password are required');
    });

    it('should return 400 if password is not specified', async () => {
      const response = await request(app).post('/register').send({ username: 'testUser' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username and password are required');
    });

    it('should return 409 if username already exists', async () => {
      userApi.getUserByUsername.mockResolvedValue({ username: 'testUser' });

      const response = await request(app)
        .post('/register')
        .send({ username: 'testUser', password: 'testPassword' });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Username already taken');
    });

    it('should return 201 on successful registration', async () => {
      userApi.getUserByUsername.mockResolvedValue(null);
      userApi.getUserById.mockResolvedValue(null);
      userApi.createUser.mockResolvedValue({ id: 'mockUserId' });

      vi.spyOn(bcrypt, 'hash').mockResolvedValue('testPassword');
      vi.spyOn(global, 'setTimeout').mockImplementation((cb) => cb);

      const response = await request(app)
        .post('/register')
        .send({ username: 'testUser', password: 'testPassword', email: 'test@test.com' });

      expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 10);
      expect(userApi.createUser).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Registration successful');
    });
  });

  describe('POST /login', () => {
    it('should should return 200 and login the user', async () => {
      passport.authenticate.mockImplementation(() => (req, res) => {
        req.user = { id: 'testUserId', username: 'testUser' };
        res.json({ message: 'Login Successful' });
      });
    });
  });

  describe('POST /logout', () => {
    it('should log the user out', async () => {
      const response = await request(app).post('/logout');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged Out');
    });
  });

  describe('GET /me', () => {
    it('should return user data if authenticated', async () => {
      const mockUser = { id: 'testUserId', username: 'testUser' };
      const req = { isAuthenticated: () => true, user: mockUser };
      const res = { json: vi.fn() };

      await authRouter.stack.find((r) => r.route.path === '/me').route.stack[0].handle(req, res);

      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
  });
});
