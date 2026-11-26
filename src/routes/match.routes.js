import express from "express";
import matchController from "../controllers/match.controller.js";
import validate from "../middlewares/validate.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";
import MatchSchema from "../validators/match.validator.js";
import ROLES from "../constants/roles.js";

const router = express.Router();

router.use(AuthMiddleware.authenticate);

router.get("/mine", matchController.mine);

router.get(
  "/history",
  AuthMiddleware.authorize(ROLES.PERSONNEL, ROLES.ADMIN),
  validate(MatchSchema.historyQuery, "query"),
  matchController.history,
);

router.get(
  "/post/:postId",
  validate(MatchSchema.postIdParam, "params"),
  matchController.forPost,
);

router.get(
  "/:ticketId",
  validate(MatchSchema.ticketIdParam, "params"),
  matchController.getById,
);

router.post(
  "/:ticketId/accept",
  validate(MatchSchema.ticketIdParam, "params"),
  matchController.accept,
);

router.post(
  "/:ticketId/refuse",
  validate(MatchSchema.ticketIdParam, "params"),
  matchController.refuse,
);

export default router;
