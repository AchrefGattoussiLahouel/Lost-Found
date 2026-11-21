import express from "express";
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
const app = express();

app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Lost & Found API is running.",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);

// Error handler (must remain last)
app.use(errorHandler);

export default app;
