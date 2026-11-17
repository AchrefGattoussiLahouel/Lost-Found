import express from "express";

import authController from "../controllers/auth.controller.js";

import validate from "../middlewares/validate.js";

import Authmiddleware from "../middlewares/auth.middleware.js";

import Schema from "../validators/auth.validator.js";

const router = express.Router();

router.post("/register", validate(Schema.registerSchema), authController.register);

router.post("/login", validate(Schema.loginSchema), authController.login);

router.get("/me", Authmiddleware.authenticate, authController.getMe);

export default router;
