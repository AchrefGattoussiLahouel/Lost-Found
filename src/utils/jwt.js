import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign({}, process.env.JWT_SECRET, {
    subject: userId.toString(),
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

export default generateToken;
