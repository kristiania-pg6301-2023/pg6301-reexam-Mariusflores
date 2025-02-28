import cors from 'cors';

/**
 * Configure CORS to allow Frontend to send requests to Backend
 * credentials: true allows cookies for authentication
 * */
export function corsMiddelware() {
  return cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });
}
