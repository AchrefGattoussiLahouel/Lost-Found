const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const app = express();

app.use(express.json({ limit: "10kb" }));
app.use("/api/auth", authRoutes);
app.use(errorHandler);

module.exports = app;
