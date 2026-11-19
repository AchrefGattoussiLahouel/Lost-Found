import express from "express";

import * as userController from "../controllers/user.controller.js";

import {
    authenticate,
    authorize,
} from "../middlewares/auth.middleware.js";

import validate from "../middlewares/validate.js";

import {
    changePasswordSchema,
    personnelListSchema,
    createPersonnelSchema,
    updatePersonnelSchema,
    userIdSchema,
} from "../validators/user.validator.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

router.use(authenticate);
router.patch(
    "/me/password",
    validate(changePasswordSchema),
    userController.changePassword
);

router.delete(
    "/me",
    userController.deleteAccount
);

router.get(
    "/personnel",
    authorize(ROLES.ADMIN),
    validate(personnelListSchema, "query"),
    userController.getPersonnel
);

router.post(
    "/personnel",
    authorize(ROLES.ADMIN),
    validate(createPersonnelSchema),
    userController.createPersonnel
);

router.patch(
    "/personnel/:id",
    authorize(ROLES.ADMIN),
    validate(userIdSchema, "params"),
    validate(updatePersonnelSchema),
    userController.updatePersonnel
);

router.delete(
    "/personnel/:id",
    authorize(ROLES.ADMIN),
    validate(userIdSchema, "params"),
    userController.deletePersonnel
);

export default router;