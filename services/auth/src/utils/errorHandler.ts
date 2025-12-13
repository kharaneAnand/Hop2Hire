export default class ErrorHandler extends Error{
    statusCode : number ;

    constructor(statuscode :number , message:string){
        super(message)
        this.statusCode = statuscode ;

        Error.captureStackTrace(this , this.constructor);
    }
}