import crypto from "node:crypto";
import Post from "../models/post.js";
import Category from "../models/category.js";
import Place from "../models/place.js";
import Errors from "../errors/index.js";
import {
  INTENTS,
  CUSTODY_STATE,
  RETENTION_DAYS,
  DEPOSIT_WINDOW_MINUTES,
} from "../constants/post.js";
import { isStaff, canView, present } from "../rules/post.rules.js";
import { getSkip, paginationMeta } from "../utils/pagination.js";

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

const generateReferenceCode = () =>
  "LF-" + crypto.randomBytes(4).toString("hex").toUpperCase();

const populate = (query) =>
  query
    .populate("category", "name icon")
    .populate("place", "name zone lat lng");

const create = async (data, actor) => {
  const [category, place] = await Promise.all([
    Category.findOne({ _id: data.category, isActive: true }),
    Place.findOne({ _id: data.place, isActive: true }),
  ]);
  if (!category) throw new Errors.InvalidCategoryError();
  if (!place) throw new Errors.InvalidPlaceError();

  const staff = isStaff(actor);
  const now = new Date();

  const doc = {
    referenceCode: generateReferenceCode(),
    intent: data.intent,
    title: data.title,
    description: data.description,
    category: data.category,
    place: data.place,
    placeDetails: data.placeDetails,
    start: data.start,
    end: data.end,
    color: data.color,
    brand: data.brand,
    photos: data.photos,
    secret_detail: data.secret_detail,
    createdBy: actor._id,
    expiresAt: new Date(now.getTime() + RETENTION_DAYS * DAY),
  };

  if (staff) {
    doc.user = data.user ?? null;
    if (!doc.user) {
      if (!data.contact) throw new Errors.ContactRequiredError();
      doc.contact = data.contact;
    }
  } else {
    doc.user = actor._id;
  }

  if (data.intent === INTENTS.FOUND) {
    if (staff) {
      doc.custody = {
        state: CUSTODY_STATE.AT_OFFICE,
        receivedBy: actor._id,
        receivedAt: now,
      };
    } else {
      doc.custody = {
        state: CUSTODY_STATE.WITH_FINDER,
        depositDeadline: new Date(
          now.getTime() + DEPOSIT_WINDOW_MINUTES * MINUTE,
        ),
      };
    }
  }

  const created = await Post.create(doc);
  return getById(created._id, actor);
};
// search for a post by its id for the owner or the staff
const getById = async (id, actor) => {
  const query = Post.findById(id);
  if (isStaff(actor)) query.select("+secret_detail");
  const post = await populate(query);
  if (!post || !canView(actor, post)) {
    throw new Errors.PostNotFoundError();
  }
  return present(actor, post);
};

// List post created by or for the actor either the staff or the owner of the post
const mine = async (actor, { page = 1, limit = 10, intent, status } = {}) => {
  const filter = { $or: [{ user: actor._id }, { createdBy: actor._id }] };
  if (intent) filter.intent = intent;
  if (status) filter.status = status;

  const skip = getSkip(page, limit);
  const [items, total] = await Promise.all([
    populate(Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    Post.countDocuments(filter),
  ]);

  return {
    items: items.map((d) => present(actor, d)),
    meta: paginationMeta({ page, limit, total }),
  };
};

// List all post only for staff
const listAll = async (actor, filters = {}) => {
  if (!isStaff(actor)) {
    throw new Errors.AuthorizationError();
  }

  const { page = 1, limit = 10, intent, status } = filters;

  const filter = {};

  if (intent) filter.intent = intent;
  if (status) filter.status = status;

  const skip = getSkip(page, limit);

  const [items, total] = await Promise.all([
    populate(Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    Post.countDocuments(filter),
  ]);

  return {
    items: items.map((d) => present(actor, d)),
    meta: paginationMeta({ page, limit, total }),
  };
};

// Update a post by its id for the owner or the staff
const update = async (id, data, actor) => {
  const query = Post.findById(id);

  if (isStaff(actor)) {
    query.select("+secret_detail");
  }

  const post = await query;

  if (!post) {
    throw new Errors.PostNotFoundError();
  }

  if (!canView(actor, post)) {
    throw new Errors.AuthorizationError();
  }

  // Don't edit posts involved in a match or already closed.
  if (post.status !== "active") {
    throw new Errors.PostNotEditableError();
  }

  // Only allow these fields to be modified.
  const editableFields = [
    "title",
    "description",
    "category",
    "place",
    "placeDetails",
    "start",
    "end",
    "color",
    "brand",
    "photos",
    "secret_detail",
  ];

  const updates = {};

  for (const field of editableFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  if (updates.category) {
    const category = await Category.findOne({
      _id: updates.category,
      isActive: true,
    });

    if (!category) throw new Errors.InvalidCategoryError();
  }

  if (updates.place) {
    const place = await Place.findOne({
      _id: updates.place,
      isActive: true,
    });

    if (!place) throw new Errors.InvalidPlaceError();
  }

  Object.assign(post, updates);

  await post.save();

  return getById(post._id, actor);
};

const getTrash = async (actor, { page = 1, limit = 10 }) => {
  const filter = { _id: actor, isDeleted: true };
  const skip = getSkip(page, limit);
  const [items, total] = await Promise.all([
    populate(Post.find(filter)).skip(skip).limit(limit),
    Post.countDocuments(filter),
  ]);

  const posts = items.map((p) => present(actor, p));

  return {
    data: posts,
    meta: paginationMeta({ page, limit, total }),
  };
};

const deleteById = async (actor, id) => {
  const post = await Post.findById(id);
  if (!post || !canView(actor, post)) {
    throw new Errors.PostNotFoundError();
  }
  if (post.isDeleted) {
    throw new Errors.ConflictError("Post already deleted.");
  }

  post.isHidden = true;
  post.isDeleted = true;
  post.deletedAt = new Date();
  post.deletedBy = actor._id;

  await post.save();
};

export default {
  create,
  getById,
  mine,
  listAll,
  update,
  getTrash,
  deleteById,
};
