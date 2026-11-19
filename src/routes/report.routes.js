import express from "express";
import reportController from "../controllers/report.controller.js";
import validate from "../middlewares/validate.js";
import Authmiddleware from "../middlewares/auth.middleware.js";
import Schema from "../validators/report.validator.js";

const router = express.Router();

// Any authenticated (active) user can report a declaration
router.use(Authmiddleware.authenticate);

router.post(
  "/",
  validate(Schema.createReportSchema),
  reportController.create,
);

router.get(
  "/mine",
  validate(Schema.listMyReportsSchema, "query"),
  reportController.listMine,
);

export default router;
