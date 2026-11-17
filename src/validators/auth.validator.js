import Joi from "joi";

const registerSchema = Joi.object({
    firstName: Joi.string().trim().min(2).max(50).required(),
    lastName: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().trim().email().lowercase().required(),
    password: Joi.string().min(8).max(128).required(),
    phone: Joi.string().trim().allow("").max(20)
}).unknown(false);

const loginSchema = Joi.object({
    email: Joi.string().trim().email().lowercase().required(),
    password: Joi.string().required()
}).unknown(false);

export default {
    registerSchema,
    loginSchema
};