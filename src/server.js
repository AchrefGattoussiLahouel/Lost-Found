import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { connectRabbitMQ } from "./queue/rabbitmq.connection.js";
import notificationRoutes from "./routes/notification.routes.js";

dotenv.config();
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRabbitMQ();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
