import Joi from "joi";

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),

    newPassword: Joi.string()
        .min(8)
        .max(128)
        .invalid(Joi.ref("currentPassword"))
        .required(),
});

export const personnelListSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
});

export const createPersonnelSchema = Joi.object({
    firstName: Joi.string().trim().min(2).max(50).required(),
    lastName: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().trim().email().lowercase().required(),
    password: Joi.string().min(8).max(128).required(),
    phone: Joi.string().trim().allow("").max(20),
});

export const updatePersonnelSchema = Joi.object({
    firstName: Joi.string().trim().min(2).max(50),
    lastName: Joi.string().trim().min(2).max(50),
    email: Joi.string().trim().email().lowercase(),
    phone: Joi.string().trim().allow("").max(20),
}).min(1);

export const userIdSchema = Joi.object({
    id: Joi.string().hex().length(24).required(),
});
export const banUserSchema = Joi.object({
    reason: Joi.string().trim().max(500).allow(""),
});