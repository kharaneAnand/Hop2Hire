import { TryCatch } from "../utils/tryCatch.js";

export const registerUser = TryCatch(async (req , res , next)=>{
    const {email} = req.body 

    res.json(email) ;
})