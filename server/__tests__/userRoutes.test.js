import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import userRouter from '../routes/userRoutes.js'; // Adjust path if needed
import * as sessionUtils from '../utils/sessionUtils.js';
import * as userApi from '../apis/userApi.js';

// Mock Express app
const app = express();
app.use(express.json());
app.use('/', userRouter);

// Mock session utility
vi.spyOn(sessionUtils, 'getUserFromSession');

// Mock database API calls
vi.spyOn(userApi, 'getUserById');
vi.spyOn(userApi, 'getUserByUsername');
vi.spyOn(userApi, 'setVerified');
vi.spyOn(userApi, 'updateUsername');

describe('User Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset all mocks before each test
  });

  describe('POST /change-username', () => {
    it('should return 401 if user is not logged in', async () => {
      sessionUtils.getUserFromSession.mockReturnValue(null);

      const response = await request(app)
        .post('/change-username')
        .send({ newUsername: 'new_user' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized. Please log in');
    });

    it('should return 409 if username is already taken', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user123');
      userApi.getUserByUsername.mockResolvedValue({ id: 'existing_user' });

      const response = await request(app)
        .post('/change-username')
        .send({ newUsername: 'existing_user' });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Username already taken');
    });

    it('should return 200 when username is successfully changed', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user123');
      userApi.getUserByUsername.mockResolvedValue(null);
      userApi.updateUsername.mockResolvedValue(true);

      const response = await request(app)
        .post('/change-username')
        .send({ newUsername: 'valid_new_username' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Username edited successfully');
    });
  });

  describe('POST /verify', () => {
    it('should return 401 if user is not logged in', async () => {
      sessionUtils.getUserFromSession.mockReturnValue(null);

      const response = await request(app).post('/verify');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized. Please log in');
    });

    it('should return 409 if user is already verified', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user123');
      userApi.getUserById.mockResolvedValue({ verified: true });

      const response = await request(app).post('/verify');

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('You are already verified');
    });

    it('should return 200 when user is successfully verified', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user123');
      userApi.getUserById.mockResolvedValue({ verified: false });
      userApi.setVerified.mockResolvedValue(true);

      const response = await request(app).post('/verify');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('You are now verified');
    });
  });
});
