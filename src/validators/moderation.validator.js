import Joi from "joi";

import { POST_STATUS } from "../constants/post.js";

const moderationParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const changePostStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(POST_STATUS))
    .required(),
});

export default {
  moderationParamsSchema,
  changePostStatusSchema,
};
