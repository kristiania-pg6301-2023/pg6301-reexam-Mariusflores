import express from "express";
import cors from "cors";
import {MongoClient} from "mongodb";
import dotenv from "dotenv";
import {postsApi} from "./apis/postsApi.js"
import passport from "passport"
import session from "express-session"
import path from 'path';
import {Strategy as GoogleStrategy} from "passport-google-oauth20"
import {findOrCreateUser, getUserById} from "./apis/userApi.js";


dotenv.config();

const app = express();

app.use(express.static("../client/dist"));


//Cors configurations
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}));

// Database Connection
const mongoClient = new MongoClient(process.env.MONGODB_URL)

mongoClient.connect().then(() => {
    console.log('Connected to mongodb');
    //app.use("/api/posts", postsApi(mongoClient.db("posts")));
});
const db = mongoClient.db(process.env.MONGODB_DBNAME);

//Middleware
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false, httpOnly: true, sameSite: "lax"}
}));

app.use(passport.initialize());
app.use(passport.session());


//Setup Passport Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {

    try {
        const user = await findOrCreateUser(db, profile, "google");
        return done(null, user)
    } catch (error) {
        return done(error);
    }

}));

//Serialize user into session
passport.serializeUser((user, done) => {
    console.log("serializing user")
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {

        const user = await getUserById(db, id);
        if (!user) return done(new Error("User not found"));
        done(null, user);
    } catch (error) {
        done(error);
    }
})

//Google OAUTH Login Route
app.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

//Google OAUTH Callback Route
app.get("/auth/google/callback",
    passport.authenticate("google", {failureRedirect: "/"}),
    (req, res) => {
        res.redirect("http://localhost:5173");
    }
)


//Dummy auth
app.post("/login", (req, res) => {
    console.log("trying to log in")
    req.session.user = {id: 1, username: "testuser"};
    res.json({message: "Login Successfull"})
    console.log("logged in")

});

//route for å sjekke om brukeren er logget inn
app.get("/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(404).json({message: "Not Authenticated"})
    }
});

// Logout
app.post("/logout", (req, res) => {
    req.logout(() => {
        res.json({message: "Logged Out"})
    })
});


app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
        return res.sendFile(path.resolve("../client/dist/index.html"));
    } else {
        next();
    }
});


const server = app.listen(process.env.PORT || 8000, async () => {
    console.log("Server started on http://localhost:" + server.address().port);
});