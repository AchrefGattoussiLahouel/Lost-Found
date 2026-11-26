import Joi from "joi";
import { POST_STATUS } from "../constants/post.js";

const searchSchema = Joi.object({
    q: Joi.string()
        .trim()
        .max(200)
        .allow("")
        .optional(),

    intent: Joi.string()
        .valid("lost", "found")
        .optional(),

    category: Joi.string()
        .trim()
        .max(50)
        .optional(),

    zone: Joi.string()
        .trim()
        .max(100)
        .allow("")
        .optional(),

    place: Joi.string()
        .trim()
        .max(100)
        .optional(),

    color: Joi.string()
        .trim()
        .max(30)
        .optional(),

    brand: Joi.string()
        .trim()
        .max(50)
        .optional(),

    lat: Joi.number()
        .min(-90)
        .max(90)
        .optional(),

    lng: Joi.number()
        .min(-180)
        .max(180)
        .optional(),

    radius: Joi.number()
        .min(0.1)
        .max(100)          // km
        .default(5)
        .optional(),

    from: Joi.date()
        .iso()
        .optional(),

    to: Joi.date()
        .iso()
        .min(Joi.ref("from"))
        .optional(),

    status: Joi.string()
        .valid(...Object.values(POST_STATUS))
        .default(POST_STATUS.ACTIVE)
        .optional(),

    sort: Joi.string()
        .valid("recent", "oldest", "relevance")
        .default("recent")
        .optional(),

    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .optional(),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(20)
        .optional()
})
    .with("lng", "lat")     // lng requires lat
    .with("lat", "lng")     // lat requires lng
    .with("to", "from");    // to requires from

export const autocompleteSchema = Joi.object({
    q: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .required(),

    intent: Joi.string()
        .valid("lost", "found")
        .optional(),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(10)
        .default(5)
        .optional()
});

export const itinerarySchema = Joi.object({
    steps: Joi.array()
        .items(
            Joi.object({
                place: Joi.string().trim().min(1).max(100).required(),
                time: Joi.date().iso().required()
            })
        )
        .min(1)
        .max(10)
        .required(),

    category: Joi.string()
        .trim()
        .max(50)
        .optional(),

    q: Joi.string()
        .trim()
        .max(200)
        .allow("")
        .optional(),

    color: Joi.string()
        .trim()
        .max(30)
        .optional(),

    brand: Joi.string()
        .trim()
        .max(50)
        .optional(),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(20)
        .optional()
});

export default searchSchema;

