import { Router } from "express";
import validate from "../middlewares/validate.js";
import searchSchema from "../validators/search.validator.js";
import { search } from "../controllers/search.controller.js";

const router = Router();

// GET /api/posts/search?q=…&intent=…&category=…&lat=…&lng=…&radius=…&from=…&to=…&status=…&sort=…&page=…&limit=…
router.get("/", validate(searchSchema, "query"), search);

export default router;
