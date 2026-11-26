import Joi from "joi";
import { TICKET_STATUS, TICKET_TIER } from "../constants/tickets.js";

const mongoObjectId = Joi.string().hex().length(24);

const ticketId = Joi.object({
  ticketId: mongoObjectId.required(),
});

const postId = Joi.object({
  postId: mongoObjectId.required(),
});

const historyQuery = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(50),
  status: Joi.string().valid(...Object.values(TICKET_STATUS)),
  tier: Joi.string().valid(...Object.values(TICKET_TIER)),
});

export default {
  ticketId,
  postId,
  historyQuery,
};
