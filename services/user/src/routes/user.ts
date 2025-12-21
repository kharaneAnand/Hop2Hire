import express from 'express' 
import { isAuth } from '../middleware/auth.js';
import { getUserProfile, myProfile, UpdateProfilePic, updateResume, updateUserProfile } from '../controller/user.js';
import uploadFile from '../middleware/multer.js';

const router = express.Router() ;
router.get("/me" , isAuth , myProfile) ;
router.get("/:userId" , isAuth , getUserProfile) ;
router.put("/update/profile" , isAuth , updateUserProfile) ;
router.put("/update/pic" , isAuth , uploadFile , UpdateProfilePic) ;
router.put("/update/resume" , isAuth , uploadFile , updateResume) ;
export default router;