import AppError from "./AppError.js";
import ERROR_CODES from "./errorCodes.js";
import * as httpErrors from "./http.errors.js";
import * as authErrors from "./auth.errors.js";

export { AppError, ERROR_CODES };
export * from "./http.errors.js";
export * from "./auth.errors.js";

export default {
    AppError,
    ERROR_CODES,
    ...httpErrors,
    ...authErrors
};
