class ApiError extends Error {
    constructor(statuscode, message = "Something went wrong", errors = []) {
        super(message);
        this.statuscode = statuscode;
        this.message = message;
        this.data = null;
        this.success = false;
        this.errors = errors;
    }

    toJSON() {
        return {
            statuscode: this.statuscode,
            message: this.message,
            data: this.data,
            success: this.success,
            errors: this.errors
        };
    }
}
export { ApiError };
