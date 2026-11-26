import jwt from "jsonwebtoken";
import { USER_STATUS } from "../constants/user.js";
import User from "../models/user.js";
import Errors from "../errors/index.js";

export const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new Errors.TokenMissingError();
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      throw new Errors.TokenMissingError();
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new Errors.TokenInvalidError();
    }

    if (!payload.sub) {
      throw new Errors.TokenInvalidError();
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      throw new Errors.TokenInvalidError();
    }

    if (user.status === USER_STATUS.SUSPENDED) {
      throw new Errors.AccountSuspendedError();
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      throw new Errors.AccountNotActiveError();
    }
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new Errors.TokenMissingError());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new Errors.InsufficientRoleError());
    }

    next();
  };
};

export default {
  authenticate,
  authorize,
};
