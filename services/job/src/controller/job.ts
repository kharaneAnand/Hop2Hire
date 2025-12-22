import axios from "axios";
import { AuthenticatedRequest } from "../middleware/auth.js";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

export const createCompany = TryCatch(async(req : AuthenticatedRequest , res , next)=>{
        const user = req.user ;

        if(!user){
            throw new ErrorHandler(401 , "Authentication Required") ;
        }

        if(user.role !== "recruiter"){
            throw new ErrorHandler(403 , "Forbidden : only recruiter can create a company ") ;
        }

        const {name , description , website} = req.body ;

        if(!name || !description || !website){
            throw new ErrorHandler(400 , "All the credientials required !") ;
        }

        const existingCompanies = await sql`
            SELECT company_id FROM companies WHERE name=${name}` ;

        if(existingCompanies.length > 0){
            throw new ErrorHandler(409 , `A company name ${name} already exists`) ;
        }

        const file = req.file ;

        if(!file){
            throw new ErrorHandler(400 , "company logo file is required") ;
        }

        const fileBuffer = getBuffer(file) ;

        if(!fileBuffer || !fileBuffer.content){
            throw new ErrorHandler(500 , "Failed to Create a File Buffer ") ;
        }

        const {data} = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/upload` , {buffer:fileBuffer.content}) ;

        const [newCompany] = await sql`
            INSERT INTO companies (name , description , website , logo , logo_public_id , recruiter_id) VALUES
            (${name} , ${description} , ${website} , ${data.url} , ${data.public_id} , ${req.user?.user_id}) RETURNING *
        `;

        res.json({
            message : "✅ company created successfully !" ,
            company : newCompany ,
        })

}) ;