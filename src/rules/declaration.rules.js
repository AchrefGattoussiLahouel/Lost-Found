
import ROLES from "../constants/roles.js";
import Errors from "../errors/index.js";

export const TRANSITIONS = {
  active: ["matched", "closed"],
  matched: ["active", "closed"],
  closed: [],
};

export const isStaff = (user) =>
  [ROLES.PERSONNEL, ROLES.ADMIN].includes(user.role);

export const isOwner = (user, d) =>
  d.user?.toString() === user._id.toString();

// Who can view a declaration?
export const canView = (user, d) =>
  isStaff(user) || isOwner(user, d);

// Fields visible to the owner
const OWNER_FIELDS = [
  "_id",
  "intent",
  "title",
  "description",
  "category",
  "place",
  "placeDetails",
  "color",
  "brand",
  "photos",
  "start",
  "end",
  "status",
  "createdAt",
  "updatedAt",
  "secret_detail",
];

export const present = (user, d) => {
  const obj = d.toObject ? d.toObject() : { ...d };

  if (isStaff(user)) return obj;

  if (isOwner(user, d)) {
    return Object.fromEntries(
      OWNER_FIELDS
        .filter((field) => field in obj)
        .map((field) => [field, obj[field]])
    );
  }

  throw new Errors.AuthorizationError();
};
