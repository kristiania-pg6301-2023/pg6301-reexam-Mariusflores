import request from 'supertest';
import { app, server } from '../server.js'; // Make sure your 'server.js' exports 'app' and 'server'

describe('Server Tests', () => {
  afterAll(() => {
    server.close(); // Close the server after all tests
  });

  test('Server should respond with 200 for unknown routes and serve frontend', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(200); // Check if the status code is 404 for unknown route
  });

  test('Auth route should exist', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).not.toBe(404); // Ensure that the '/auth' route exists
  });

  test('Post route should exist', async () => {
    const res = await request(app).get('/post/all');
    expect(res.status).not.toBe(404); // Ensure that the '/post' route exists
  });

  test('User route should exist', async () => {
    const res = await request(app).post('/user/verify');
    expect(res.status).not.toBe(404); // Ensure that the '/user' route exists
  });
});
