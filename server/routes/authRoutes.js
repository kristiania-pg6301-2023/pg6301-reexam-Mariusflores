import express from 'express';
import passport from '../config/passport.js';

const router = express.Router();

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
 * Dummy auth
 *
 * router.post("/login", (req, res) => {
 *     console.log("trying to log in")
 *     req.session.user = {id: 1, username: "testuser"};
 *     res.json({message: "Login Successfull"})
 *     console.log("logged in")
 *
 * });
 */

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
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged Out' });
  });
});

export default router;
