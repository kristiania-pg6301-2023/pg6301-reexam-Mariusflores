import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import {postsApi} from "./apis/postsApi.js"
import passport from "passport"
import session from "express-session"
import path from 'path';


dotenv.config();

const app = express();

app.use(express.static("../client/dist"));


//Cors configurations
app.use (cors({
    origin:["http://localhost:5173"],
    credentials: true
}));

// Database Connection
const mongoClient = new MongoClient(process.env.MONGODB_URL)

mongoClient.connect().then(async ()  => {
    console.log('Connected to mongodb');
    //app.use("/api/posts", postsApi(mongoClient.db("posts")));

});

//Middleware

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie:{secure: false, httpOnly: true, sameSite: "lax"}
}));

app.use(passport.initialize());
app.use(passport.session());

//Dummy auth
app.post("/login", (req, res) =>{
    console.log("trying to log in")
    req.session.user = {id: 1, username: "testuser"};
    res.json({message: "Login Successfull"})
    console.log("logged in")

});

//route for å sjekke om brukeren er logget inn
app.get("/auth/me", (req, res) => {
    if (req.session.user){
        res.json(req.session.user);
    }else{
        res.status(404).json({message: "Not Authenticated"})
    }
});

// Logout
app.post("/logout", (req, res) => {
    req.session.destroy(() => {
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
    console.log("Server started on http://localhost:"+ server.address().port);
});