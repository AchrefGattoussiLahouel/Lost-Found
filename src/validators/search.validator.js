import Joi from "joi";

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
        .valid("active", "resolved", "expired")
        .default("active")
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

export default searchSchema;

