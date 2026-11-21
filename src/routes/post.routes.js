import express from "express";
import postController from "../controllers/post.controller.js";
import validate from "../middlewares/validate.js";
import Authmiddleware from "../middlewares/auth.middleware.js";
import Schema from "../validators/post.validator.js";

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
  validate(Schema.listQuerySchema, "query"),
  postController.listAll,
);

router.get("/:id", validate(Schema.idParam, "params"), postController.getById);

export default router;
