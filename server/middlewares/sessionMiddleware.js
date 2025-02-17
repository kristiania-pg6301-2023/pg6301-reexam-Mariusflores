import session from "express-session";

/**
 * Stores session data
 * resave:false -> prevents unnecessary saving
 * saveUninitialized:false -> dont save empty sessions
 * secure: false -> cookies not required to be https
 * httpOnly:true -> javaScript cannot access cookies
 * */

export function sessionMiddleware() {
    return session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {secure: false, httpOnly: true, sameSite: "lax"}
    });
}