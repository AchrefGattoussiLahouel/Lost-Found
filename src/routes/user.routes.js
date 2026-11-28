import express from "express";

import * as userController from "../controllers/user.controller.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";

import validate from "../middlewares/validate.js";

import {
  changePasswordSchema,
  personnelListSchema,
  createPersonnelSchema,
  updatePersonnelSchema,
  userIdSchema,
  banUserSchema,
} from "../validators/user.validator.js";

import { USER_ROLES } from "../constants/user.js";

const router = express.Router();

router.use(authenticate);

router.patch(
  "/me/password",
  validate(changePasswordSchema),
  userController.changePassword,
);

router.delete("/me", userController.deleteAccount);

router.get(
  "/personnel",
  authorize(USER_ROLES.ADMIN),
  validate(personnelListSchema, "query"),
  userController.getPersonnel,
);

router.post(
  "/personnel",
  authorize(USER_ROLES.ADMIN),
  validate(createPersonnelSchema),
  userController.createPersonnel,
);

router.patch(
  "/personnel/:id",
  authorize(USER_ROLES.ADMIN),
  validate(userIdSchema, "params"),
  validate(updatePersonnelSchema),
  userController.updatePersonnel,
);

router.delete(
  "/personnel/:id",
  authorize(USER_ROLES.ADMIN),
  validate(userIdSchema, "params"),
  userController.deletePersonnel,
);
router.patch(
  "/:id/ban",
  authorize(USER_ROLES.ADMIN, USER_ROLES.PERSONNEL),
  validate(userIdSchema, "params"),
  validate(banUserSchema),
  userController.banUser,
);

router.patch(
  "/:id/unban",
  authorize(USER_ROLES.ADMIN, USER_ROLES.PERSONNEL),
  validate(userIdSchema, "params"),
  userController.unbanUser,
);
export default router;
