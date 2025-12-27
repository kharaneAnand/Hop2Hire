import express from "express";
import dotenv from "dotenv";
import aiRouter from "./routes/router.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use("/api/ai", aiRouter);

export default app;
