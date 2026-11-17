import express from "express";
import errorHandler from "./middlewares/errorHandler.js";
import searchRoutes from "./routes/search.routes.js";

const app = express();

app.use(express.json({ limit: "10kb" }));

// ── Routes ──────────────────────────────────────────────────────
app.use("/api/posts/search", searchRoutes);

// ── Error handler (must be last) ────────────────────────────────
app.use(errorHandler);

export default app;
