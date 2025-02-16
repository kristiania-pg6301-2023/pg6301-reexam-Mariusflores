import express from "express";
import cors from "cors";

const app = express();

// cors options for allowing vite frontend to access server
const corsOptions = {
origin:["http://localhost:5173"]
};

//implement corsOptions
app.use (cors(corsOptions));


app.get("/", (req, res) => {
res.json({ veggies: ["potato", "tomato"] });
})

const server = app.listen(8080, () => {
console.log("Server started on http://localhost:" + server.address().port)
});