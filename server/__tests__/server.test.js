import request from 'supertest';
import { app, server } from '../server.js';

describe('Server Tests', () => {
  afterAll(() => {
    server.close();
  });

  test('Server should respond with 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
  });

  test('Auth route should exist', async () => {
    const res = await request(app).get('/auth');
    expect(res.status).not.toBe(404);
  });
});
