
const { ValidationError } = require("../errors");

const JOI_ERROR_CODES = {
    "any.required": "FIELD_REQUIRED",
    "string.empty": "FIELD_REQUIRED",
    "string.min": "TOO_SHORT",
    "string.max": "TOO_LONG",
    "string.email": "INVALID_EMAIL",
    "string.pattern.base": "INVALID_FORMAT",
    "number.base": "MUST_BE_NUMBER",
    "number.min": "TOO_SMALL",
    "number.max": "TOO_LARGE",
    "any.only": "INVALID_CHOICE",
    "date.base": "INVALID_FORMAT",
    "date.max": "INVALID_VALUE"
};

const validate = (schema, source = "body") => (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
        convert: true
    });

    if (error) {
        const details = {};

        for (const issue of error.details) {
            const field = issue.path.join(".") || "_root";

            const code = JOI_ERROR_CODES[issue.type] || "INVALID_VALUE";

            const params = {};

            if (issue.context?.limit !== undefined) {
                params.limit = issue.context.limit;
            }

            if (issue.context?.valids !== undefined) {
                params.valid = issue.context.valids;
            }

            if (!details[field]) {
                details[field] = [];
            }

            details[field].push({ code, params });
        }

        return next(new ValidationError(details));
    }

    req.validated = req.validated || {};
    req.validated[source] = value;

    next();
};

module.exports = validate;
