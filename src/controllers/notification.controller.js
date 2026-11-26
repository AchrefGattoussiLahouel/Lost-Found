import notificationService from "../services/notification.service.js";

const getUserId = (req) => req.user?.id || req.user?._id;

class NotificationController {
  // GET /api/notifications
  async getNotifications(req, res, next) {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

      const result = await notificationService.getUserNotifications(
        userId,
        page,
        limit,
      );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notifications/unread-count
  async getUnreadCount(req, res, next) {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const count = await notificationService.getUnreadCount(userId);

      return res.status(200).json({
        success: true,
        unreadCount: count,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/notifications/:id/read
  async markAsRead(req, res, next) {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const notification = await notificationService.markAsRead(
        req.params.id,
        userId,
      );

      if (!notification) {
        return res.status(404).json({
          message: "Notification not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Notification marked as read",
        notification,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/notifications/read-all
  async markAllAsRead(req, res, next) {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const result = await notificationService.markAllAsRead(userId);

      return res.status(200).json({
        success: true,
        message: "All notifications marked as read",
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
