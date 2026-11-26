import Notification from "../models/notification.js";

class NotificationService {
  // Créer une notification
  async createNotification({ recipient, type, title, message, data = {} }) {
    if (!recipient) {
      throw new Error("Notification recipient is required");
    }

    return await Notification.create({
      recipient,
      type,
      title,
      message,
      data,
    });
  }

  // Créer une notification lorsqu'un matching est trouvé
  async notifyMatchingFound({ recipient, matchingId, postId, score }) {
    return await this.createNotification({
      recipient,
      type: "MATCH_FOUND",
      title: "Nouveau matching trouvé",
      message: "Un objet correspondant à votre recherche a été trouvé.",
      data: {
        matchingId,
        postId,
        score,
      },
    });
  }

  // Récupérer les notifications d'un utilisateur
  async getUserNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Notification.countDocuments({ recipient: userId }),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Compter les notifications non lues
  async getUnreadCount(userId) {
    return await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: userId,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
      { new: true },
    );
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(userId) {
    return await Notification.updateMany(
      {
        recipient: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
    );
  }
}

export default new NotificationService();
