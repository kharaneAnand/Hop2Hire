import express from "express";
import jobRouter from "./routes/job.js";

const app = express() ;
app.use(express.json()) ;
app.use("/api/job" , jobRouter) ;
export default app ;
