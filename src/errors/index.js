
const AppError = require("./AppError");
const ERROR_CODES = require("./errorCodes");

const httpErrors = require("./http.errors");
const authErrors = require("./auth.errors");

module.exports = {
    AppError,
    ERROR_CODES,
    ...httpErrors,
    ...authErrors
};
