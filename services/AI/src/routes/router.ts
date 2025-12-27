import express from "express";
import {careerGuide, resumeAnalyzer } from "../controller/Ai.js";


const router = express.Router() ;
router.post("/career" , careerGuide) ;
router.post("/resume-analyser" , resumeAnalyzer) ;

export default router ;