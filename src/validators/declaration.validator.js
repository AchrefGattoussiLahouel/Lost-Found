import Joi from "joi";
import { INTENTS, DECLARATION_STATUS } from "../constants/declaration.js";

const objectId = Joi.string().hex().length(24);

const fields = {
  title: Joi.string().trim().min(3).max(120),
  description: Joi.string().trim().allow("").max(1000),
  category: objectId,
  place: objectId,
  placeDetails: Joi.string().trim().max(200),
  start: Joi.date().max("now"),
  end: Joi.date().min(Joi.ref("start")),
  photos: Joi.array().items(Joi.string().uri()).max(5),
  secret_detail: Joi.string().trim().allow("").max(300),
};

const createDeclaration = Joi.object({
  intent: Joi.string().valid(...Object.values(INTENTS)).required(),
  ...fields,
  title: fields.title.required(),
  category: objectId.required(),
  place: objectId.required(),
  start: fields.start.required(),

  //just for the staff if there is no user given, a contact is required
  user: objectId,
  contact: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    phone: Joi.string().trim().max(20).required(),
  }),
});

const updateDeclaration = Joi.object({ ...fields }).min(1); 

const idParam = Joi.object({ id: objectId.required() });

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(50),
  intent: Joi.string().valid(...Object.values(INTENTS)),
  status: Joi.string().valid(...Object.values(DECLARATION_STATUS)),
});

export default { createDeclaration, updateDeclaration, idParam, listQuerySchema };