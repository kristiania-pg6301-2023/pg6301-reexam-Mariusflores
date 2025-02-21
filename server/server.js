import express from 'express';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { connectDB } from './config/db.js';
import { corsMiddelware } from './middlewares/corsMiddelware.js';
import { sessionMiddleware } from './middlewares/sessionMiddleware.js';

dotenv.config();

const app = express();

/**
 * Middleware
 * */

app.use(corsMiddelware());
app.use(express.json());

app.set('trust proxy', 1); // Set app to trust default heroku proxy
app.use(sessionMiddleware());
app.use(express.static('../client/dist'));

//Starts passport.js authentication
app.use(passport.initialize());
//Uses Express sessions to store logged-in users
app.use(passport.session());

/**
 * Routes
 * */
app.use('/auth', authRoutes);
app.use('/post', postRoutes);
app.use('/user', userRoutes);

/**
 * Serve Frontend
 * */
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.resolve('../client/dist/index.html'));
  } else {
    next();
  }
});

/**
 * Start Server
 * */

const server = app.listen(process.env.PORT || 8000, async () => {
  await connectDB();
  console.log('Server started on http://localhost:' + server.address().port);
});

export { app, server };
