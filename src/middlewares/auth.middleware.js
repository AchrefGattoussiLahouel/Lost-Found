const jwt = require("jsonwebtoken");

const User = require("../models/user");

const {
    TokenMissingError,
    TokenInvalidError,
    InsufficientRoleError
} = require("../errors");

const authenticate = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            throw new TokenMissingError();
        }

        const token = authorization.split(" ")[1];

        if (!token) {
            throw new TokenMissingError();
        }

        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (!payload.sub) {
            throw new TokenInvalidError();
        }

        const user = await User.findById(payload.sub);

        if (!user) {
            throw new TokenInvalidError();
        }

        req.user = user;

        next();
    } catch (error) {
        next(error);
    }
};

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new TokenMissingError());
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new InsufficientRoleError());
        }

        next();
    };
};

module.exports = {
    authenticate,
    authorize
};