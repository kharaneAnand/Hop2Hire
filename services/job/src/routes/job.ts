import express from "express";
import { isAuth } from "../middleware/auth.js";
import uploadFile from "../middleware/multer.js";
import { createCompany, createJob, deleteCompany } from "../controller/job.js";

const router = express.Router() ;

router.post("/company/new" , isAuth , uploadFile , createCompany) ;
router.delete("/company/:companyId" , isAuth , deleteCompany) ;
router.post("/new" , isAuth , createJob) ;

export default router ;