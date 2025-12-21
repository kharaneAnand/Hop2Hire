import dotenv from "dotenv" ;
import app from "./app.js" ;


dotenv.config() ;

app.listen(()=>{
    console.log(`job service is running on http://localhost:${process.env.PORT}`) ;
})