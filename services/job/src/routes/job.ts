import express from "express";
import { isAuth } from "../middleware/auth.js";
import uploadFile from "../middleware/multer.js";
import { createCompany, createJob, deleteCompany, getAllCompany, getCompanyDetails, updateJob } from "../controller/job.js";

const router = express.Router() ;

router.post("/company/new" , isAuth , uploadFile , createCompany) ;
router.delete("/company/:companyId" , isAuth , deleteCompany) ;
router.post("/new" , isAuth , createJob) ;
router.put("/:jobId" , isAuth , updateJob) ;
router.get("/company/all" , isAuth , getAllCompany) ;
router.get("/company/:id" , isAuth , getCompanyDetails) ;

export default router ;