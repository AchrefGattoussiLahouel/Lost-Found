import { Router } from "express";
import validate from "../middlewares/validate.js";
import searchSchema, { autocompleteSchema, itinerarySchema } from "../validators/search.validator.js";
import { search, autocomplete, searchItinerary } from "../controllers/search.controller.js";

const router = Router();

// POST /api/posts/search/itinerary
router.post("/itinerary", validate(itinerarySchema, "body"), searchItinerary);

// GET /api/posts/search/autocomplete?q=…&limit=…&intent=…
router.get("/autocomplete", validate(autocompleteSchema, "query"), autocomplete);

// GET /api/posts/search?q=…&intent=…&category=…&lat=…&lng=…&radius=…&from=…&to=…&status=…&sort=…&page=…&limit=…
router.get("/", validate(searchSchema, "query"), search);

export default router;

