import express from "express";
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import reportRoutes from "./routes/report.routes.js";
import moderationRoutes from "./routes/moderation.routes.js";
import searchRoutes from "./routes/search.routes.js";

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
app.use("/api/report", reportRoutes);
app.use("/api/moderation", moderationRoutes);

// Error handler (must remain last)
// ── Routes ──────────────────────────────────────────────────────
app.use("/api/posts/search", searchRoutes);

// ── Error handler (must be last) ────────────────────────────────
app.use(errorHandler);

export default app;
