import session from 'express-session';
import MongoStore from 'connect-mongo';

/**
 * Stores session data
 * resave:false -> prevents unnecessary saving
 * saveUninitialized:false -> don't save empty sessions
 * secure: process.env.NODE_ENV === 'production' -> Cookies required to be https in production
 * httpOnly:true -> javaScript cannot access cookies
 * */

export function sessionMiddleware() {
  return session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      ttl: 3 * 24 * 60 * 60, // Sessions expire in 3 days
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Secure cookies only in production
      httpOnly: true, // Prevents XSS attacks
      sameSite: 'lax', // Helps prevent CSRF attacks
    },
  });
}
