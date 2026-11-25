import express from "express";
import moderationController from "../controllers/moderation.controller.js";
import validate from "../middlewares/validate.js";
import Authmiddleware from "../middlewares/auth.middleware.js";
import { USER_ROLES } from "../constants/user.js";
import Schema from "../validators/moderation.validator.js";

const router = express.Router();

router.use(Authmiddleware.authenticate);

router.patch(
  "/post/:id/hide",
  Authmiddleware.authorize(USER_ROLES.ADMIN),
  validate(Schema.moderationParamsSchema, "params"),
  moderationController.hidePost,
);
router.patch(
  "/post/:id/restore",
  Authmiddleware.authorize(USER_ROLES.ADMIN),
  validate(Schema.moderationParamsSchema, "params"),
  moderationController.restorePost,
);
router.patch(
  "/post/:id/delete",
  Authmiddleware.authorize(USER_ROLES.ADMIN),
  validate(Schema.moderationParamsSchema, "params"),
  moderationController.deletePost,
);
router.patch(
  "/post/:id/restore-delete",
  Authmiddleware.authorize(USER_ROLES.ADMIN),
  validate(Schema.moderationParamsSchema, "params"),
  moderationController.restoreDeletedPost,
);
router.patch(
  "/post/:id/status",
  Authmiddleware.authorize(USER_ROLES.ADMIN),
  validate(Schema.moderationParamsSchema, "params"),
  validate(Schema.changePostStatusSchema),
  moderationController.changePostStatus,
);

router.patch(
  "/user/:id/suspend",
  Authmiddleware.authorize(USER_ROLES.ADMIN),
  validate(Schema.moderationParamsSchema, "params"),
  moderationController.suspendUser,
);
router.patch(
  "/user/:id/reactivate",
  Authmiddleware.authorize(USER_ROLES.ADMIN),
  validate(Schema.moderationParamsSchema, "params"),
  moderationController.reactivateUser,
);

export default router;
