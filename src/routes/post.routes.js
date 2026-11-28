import express from "express";
import postController from "../controllers/post.controller.js";
import validate from "../middlewares/validate.js";
import Authmiddleware from "../middlewares/auth.middleware.js";
import Schema from "../validators/post.validator.js";
import { USER_ROLES } from "../constants/user.js";

const router = express.Router();

router.use(Authmiddleware.authenticate);

router.post("/", validate(Schema.createPost), postController.create);
router.get(
  "/mine",
  validate(Schema.listQuerySchema, "query"),
  postController.mine,
);

router.get(
  "/all",
  Authmiddleware.authorize(USER_ROLES.ADMIN, USER_ROLES.PERSONNEL),
  validate(Schema.listQuerySchema, "query"),
  postController.listAll,
);
router.get(
  "/trash",
  validate(Schema.listQuerySchema, "query"),
  postController.getTrash,
);
router.get("/:id", validate(Schema.idParam, "params"), postController.getById);
router.patch(
  "/:id",
  validate(Schema.idParam, "params"),
  validate(Schema.updateSchema, "body"),
  postController.update,
);
router.delete(
  "/:id",
  validate(Schema.idParam, "params"),
  postController.deleteById,
);

router.post(
  "/:id/deposit",
  validate(Schema.idParam, "params"),
  postController.declareDeposit,
);

router.post(
  "/:id/receive",
  Authmiddleware.authorize(USER_ROLES.ADMIN, USER_ROLES.PERSONNEL),
  validate(Schema.idParam, "params"),
  validate(Schema.receiveAtOfficeSchema, "body"),
  postController.receiveAtOffice,
);

export default router;
