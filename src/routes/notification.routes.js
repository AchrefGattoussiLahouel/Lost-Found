import express from "express";
import notificationController from "../controllers/notification.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware.authenticate);

router.get("/", (req, res, next) =>
  notificationController.getNotifications(req, res, next),
);

router.get("/unread-count", (req, res, next) =>
  notificationController.getUnreadCount(req, res, next),
);

router.patch("/read-all", (req, res, next) =>
  notificationController.markAllAsRead(req, res, next),
);

router.patch("/:id/read", (req, res, next) =>
  notificationController.markAsRead(req, res, next),
);

export default router;
