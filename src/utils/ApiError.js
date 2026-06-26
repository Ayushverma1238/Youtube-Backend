class ApiError extends Error {
    constructor (message = "Something went wrong", statusCode, errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        // this.error = error;
        this.data = null;
        this.success = false;
        this.errors= this.error

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}