import { Router } from "express";
import validate from "../middlewares/validate.js";
import searchSchema, { autocompleteSchema } from "../validators/search.validator.js";
import { search, autocomplete } from "../controllers/search.controller.js";

const router = Router();

// GET /api/posts/search/autocomplete?q=…&limit=…&intent=…
router.get("/autocomplete", validate(autocompleteSchema, "query"), autocomplete);

// GET /api/posts/search?q=…&intent=…&category=…&lat=…&lng=…&radius=…&from=…&to=…&status=…&sort=…&page=…&limit=…
router.get("/", validate(searchSchema, "query"), search);

export default router;

