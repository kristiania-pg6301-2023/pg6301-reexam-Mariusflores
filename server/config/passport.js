import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';
import { db } from './db.js';
import {
  findOrCreateUser,
  getUserById,
  getUserByUsername,
  verifyPassword,
} from '../apis/userApi.js';

/**
 * Local Strategy
 * */

passport.use(
  new LocalStrategy(
    { usernameField: 'username', passwordField: 'password' },
    async (username, password, done) => {
      try {
        const user = await getUserByUsername(db, username);
        if (!user) return done(null, false, { message: 'User not found' });

        const isValid = await verifyPassword(user, password);
        if (!isValid) return done(null, false, { message: 'Invalid password' });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

/**
 * Setup Passport Google OAuth Strategy
 * Uses Google OAuth 2.0 Login
 * retrieves profile and email
 * Calls findOrCreateUser -> if user exists, log in, if new, create account and log in
 * */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(db, profile, 'google');
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

/**
 * Setup GitHub OAuth Strategy
 * */

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        //Check if user exists in db
        const user = await findOrCreateUser(db, profile, 'github');
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

/**
 * Serialize user into session
 * Stores user ID in the session
 * */
passport.serializeUser((user, done) => {
  console.log('serializing user');
  done(null, user.id);
});

/**
 * Deserializing user
 * Retrieves user from MongoDB
 * */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(db, id);
    if (!user) return done(new Error('User not found'));
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
