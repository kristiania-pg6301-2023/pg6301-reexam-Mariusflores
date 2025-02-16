import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import {configDotenv} from "dotenv";
import {connectToMongoDB} from "./db/mongoClient.js"


configDotenv();

const app = express();

// cors options for allowing vite frontend to access server
const corsOptions = {
origin:["http://localhost:5173"]
};

const mongoClient = new MongoClient(process.env.MONGODB_URL);


connectToMongoDB(mongoClient).then(() =>{

console.log("connected to Mongodb")
});

//implement corsOptions
app.use (cors(corsOptions));




const server = app.listen(8080, () => {
console.log("Server started on http://localhost:" + server.address().port)
});