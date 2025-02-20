import express from 'express';
import passport from '../config/passport.js';
import { createUser, getUserByUsername } from '../apis/userApi.js';
import { db } from '../config/db.js';
import dotenv from 'dotenv';

const router = express.Router();

dotenv.config();


/**
 * Post Routes
 * */

/**
 * Register User locally
 * */
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Check if username or password is missing
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = await getUserByUsername(db, username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    // Create new user
    const newUser = await createUser(db, username, password, email);

    console.log('✅ User registered:', newUser); // Debugging log

    return res.status(201).json({ message: 'Registration successful' }); // Ensure response is sent once
  } catch (error) {
    console.error('❌ Registration error:', error);

    return res.status(500).json({ message: 'Internal server error' }); // Catch unexpected errors
  }
});

/**
 * Login Local User Auth
 * */

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Login Successful', user: req.user });
});

/**
 * Logout
 * */
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy((err) => {
      // ✅ Ensure session is destroyed
      if (err) console.error('Session destroy error:', err);
      res.clearCookie('connect.sid', { path: '/' });
      res.json({ message: 'Logged Out' });
    });
  });
});

/**
 * Get Routes
 * */

/**
 * Google OAUTH Login Route
 * Redirects user to Google Login Page
 * */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);

/**
 * Google OAUTH Callback Route
 * Redirects User to react app after successful login
 * */
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  },
);

/**
 * GitHub OAuth Login Route
 **/

router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['user:email'],
  }),
);

/**
 * GitHub OAuth Callback
 * */
router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login',
    successRedirect: '/profile',
  }),
);
/**
 * Checks If user logged in
 * */
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(404).json({ message: 'Not Authenticated' });
  }
});

export default router;
