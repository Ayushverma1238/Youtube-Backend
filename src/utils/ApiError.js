class ApiError extends Error {
    constructor (message = "Something went wrong", statusCode, errors = [], statck = "") {
        super(message);
        this.statusCode = statusCode;
        // this.error = error;
        this.data = null;
        this.success = false;
        this.errors= this.error

        if(statck){
            this.statck = statck
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}