import express from "express";
import declarationController from "../controllers/declaration.controller.js";
import validate from "../middlewares/validate.js";
import Authmiddleware from "../middlewares/auth.middleware.js";
import Schema from "../validators/declaration.validator.js";

const router = express.Router();

router.use(Authmiddleware.authenticate);

router.post(
  "/",
  validate(Schema.createDeclaration),
  declarationController.create,
);
router.get(
  "/mine",
  validate(Schema.listQuerySchema, "query"),
  declarationController.mine,
);

router.get(
  "/all",
  validate(Schema.listQuerySchema, "query"),
  declarationController.listAll,
);

router.get(
  "/:id",
  validate(Schema.idParam, "params"),
  declarationController.getById,
);

export default router;
