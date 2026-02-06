import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import userroute from "./route/userroute.js";
import landroute from "./route/landRoutes.js";
dotenv.config();

const app = express();

connectDB();

app.use(express.json());

// routes
app.use("/api/auth/user", userroute);
app.use("/api/land", landroute );


app.get("/", (req, res) => {
  res.send("API running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});