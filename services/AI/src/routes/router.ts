import express from "express";
import {careerGuide } from "../controller/Ai.js";


const router = express.Router() ;
router.post("/career" , careerGuide) ;

export default router ;