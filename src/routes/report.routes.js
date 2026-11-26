import express from "express";

import reportController from "../controllers/report.controller.js";
import validate from "../middlewares/validate.js";
import Authmiddleware from "../middlewares/auth.middleware.js";
import Schema from "../validators/report.validator.js";
import { USER_ROLES } from "../constants/user.js";

const router = express.Router();

router.use(Authmiddleware.authenticate);

router.post("/", validate(Schema.createReportSchema), reportController.create);

router.get(
  "/mine",
  validate(Schema.listMyReportsSchema, "query"),
  reportController.listMine,
);

router.get(
  "/",
  Authmiddleware.authorize(USER_ROLES.ADMIN),
  validate(Schema.listReportsSchema, "query"),
  reportController.list,
);

router.get(
  "/:id",
  Authmiddleware.authorize(USER_ROLES.ADMIN),
  validate(Schema.getReportByIdSchema, "params"),
  reportController.getById,
);

router.patch(
  "/:id",
  Authmiddleware.authorize(USER_ROLES.ADMIN),
  validate(Schema.getReportByIdSchema, "params"),
  validate(Schema.processReportSchema),
  reportController.process,
);

export default router;
