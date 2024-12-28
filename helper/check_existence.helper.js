const dataExist = (model, message, statuscode) => {
    if (model) {
        const error = new Error(message);
        error.statusCode = statuscode;
        throw error
    }
}

const dataNotExist = (model, message, statuscode) => {
    if (!model) {
        const error = new Error(message);
        error.statusCode = statuscode;
        throw error
    }
}

const newError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error
}
module.exports = { dataExist, dataNotExist , newError }