import express from 'express';
import passport from '../config/passport.js';
import { createUser, getUserByUsername } from '../apis/userApi.js';
import { db } from '../config/db.js';

const router = express.Router();

/**
 * Register User locally
 * */
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Check if username or password is missing
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if user already exists
    const existingUser = await getUserByUsername(db, username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already taken" });
    }

    // Create new user
    const newUser = await createUser(db, username, password, email);

    console.log("✅ User registered:", newUser); // Debugging log

    return res.status(201).json({ message: "Registration successful" }); // Ensure response is sent once
  } catch (error) {
    console.error("❌ Registration error:", error);

    return res.status(500).json({ message: "Internal server error" }); // Catch unexpected errors
  }
});


/**
 * Login Local User Auth
 * */

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({message: 'Login Successful', user: req.user});
});

/**
 * Google OAUTH Login Route
 * Redirects user to Google Login Page
 * */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

/**
 * Google OAUTH Callback Route
 * Redirects User to react app after successful login
 * */
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('http://localhost:5173');
  }
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

/**
 * Logout
 * */
router.post('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie('connect.sid', { path: '/' }); // Clear session cookie
      res.json({ message: 'Logged Out' });
    });
  });
});



export default router;
