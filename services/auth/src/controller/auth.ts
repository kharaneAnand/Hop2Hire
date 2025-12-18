import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import bcrypt from 'bcrypt' ;
import axios from "axios";
import jwt from 'jsonwebtoken' ;

export const registerUser =TryCatch(async(req , res , next)=>{
    const {name , email , password , phoneNumber , role , bio} = req.body ;
    
    if(!name || !email || !password || !phoneNumber || !role) {
      throw new  ErrorHandler(400 ,"Please fill all details") ;
    }

    const existingUsers = await sql`SELECT user_id  FROM users WHERE email = ${email}` ;

    if(existingUsers.length > 0){
        throw new ErrorHandler(409 , "User with this email already exists") ;
    }

    const hashPassword = await bcrypt.hash(password , 10) ;
    
    let registeredUser;
    if(role == 'recruiter'){

        const [user] = await sql`INSERT INTO users(name  , email , password , phone_number , role) VALUES 
        (${name} , ${email} , ${hashPassword} , ${phoneNumber} , ${role}) RETURNING 
        user_id , name , email , phone_number , role , created_at` ;

            registeredUser = user ;

    } else if(role==="jobseeker"){
        const file  = req.file ;

        if(!file){
            throw new ErrorHandler(400 , "Resume file is Required  for jobseekers , please upload your Resume !") ;
        }

        const fileBuffer = getBuffer(file) ;
        if(!fileBuffer){
            throw new ErrorHandler(500 , "Failed to generate a Buffer") ;
        }


        const {data} = await axios.post(
            `${process.env.UPLOAD_SERVICE}/api/utils/upload` ,
             {buffer : fileBuffer.content}
            ); 

         const [user] = await sql`INSERT INTO users(name  , email , password , phone_number , role , bio , resume  ,resume_public_id ) VALUES 
        (${name} , ${email} , ${hashPassword} , ${phoneNumber} , ${role} , ${bio} , ${data.url} , ${data.public_id}) RETURNING 
        user_id , name , email , phone_number , role ,bio , resume , created_at` ;

         registeredUser = user 
        
    }

    const token = jwt.sign({id : registeredUser?.user_id} , process.env.JWT_SEC as string , {
        expiresIn:"15d" ,
    });

    res.json({
        message : "user Registered" ,
       registeredUser,
       token,
    }) ;
})