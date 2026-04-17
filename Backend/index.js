import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import userroute from "./route/userroute.js";
import landRoutes from "./route/landRoutes.js";
import documentRoutes from "./route/documentRoutes.js";
import transferRoutes from "./route/transferRoutes.js";
import dashboardRoutes from "./route/dashboardRoutes.js";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth/user", userroute);
app.use("/api", landRoutes);
app.use("/api", documentRoutes);
app.use("/api", transferRoutes);
app.use("/api", dashboardRoutes);

app.get("/", (_req, res) => {
  res.send("API running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
