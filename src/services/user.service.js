import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { ROLES } from "../constants/user.js";
import { STATUS } from "../constants/user.js";
import generateToken from "../utils/jwt.js";
import Errors from "../errors/index.js";

const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : { ...user };

  delete userObject.password;
  delete userObject.__v;

  return userObject;
};

const register = async (userData) => {
  const existingUser = await User.exists({
    email: userData.email,
  });

  if (existingUser) {
    throw new Errors.EmailAlreadyExistsError();
  }

  const hashedPassword = await bcrypt.hash(userData.password, 12);

  const user = await User.create({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    password: hashedPassword,
    phone: userData.phone || null,
    role: ROLES.MEMBRE,
    status: STATUS.PENDING,
  });

  const token = generateToken(user._id);

  return {
    user: sanitizeUser(user),
    message:
      "User registered successfully. Please check your email to activate your account.",
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Errors.InvalidCredentialsError();
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  const status = user.status;

  if (!passwordMatches) {
    throw new Errors.InvalidCredentialsError();
  }

  if (status !== STATUS.ACTIVE) {
    throw new Errors.AccountNotActiveError();
  }

  const token = generateToken(user._id);

  return {
    user: sanitizeUser(user),
    token,
  };
};

export default {
  register,
  login,
};
