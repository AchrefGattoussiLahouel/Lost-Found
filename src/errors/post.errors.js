import { AppError } from "./AppError.js";

class PostNotFoundError extends AppError {
  constructor() {
    super({
      status: 404,
      code: "POST_NOT_FOUND",
      message: "Post not found.",
    });
  }
}
class InvalidCategoryError extends AppError {
  constructor() {
    super({
      status: 422,
      code: "INVALID_CATEGORY",
      message: "Category does not exist or is inactive.",
      details: { category: [{ code: "INVALID_CHOICE", params: {} }] },
    });
  }
}

class InvalidPlaceError extends AppError {
  constructor() {
    super({
      status: 422,
      code: "INVALID_PLACE",
      message: "Place does not exist or is inactive.",
      details: { place: [{ code: "INVALID_CHOICE", params: {} }] },
    });
  }
}

class ContactRequiredError extends AppError {
  constructor() {
    super({
      status: 422,
      code: "CONTACT_REQUIRED",
      message: "A contact is required when no user is given.",
      details: { contact: [{ code: "FIELD_REQUIRED", params: {} }] },
    });
  }
}

class InvalidPostStatusError extends AppError {
  constructor() {
    super({
      status: 422,
      code: "INVALID_POST_STATUS",
      message: "Invalid post status.",
    });
  }
}
export class InvalidCustodyStateError extends AppError {
  constructor(current) {
    super({
      status: 409,
      code: "INVALID_CUSTODY_STATE",
      message: "This action is not allowed in the current custody state.",
      details: { current },
    });
  }
}

export class NotAFoundObjectError extends AppError {
  constructor() {
    super({
      status: 409,
      code: "NOT_A_FOUND_OBJECT",
      message: "This action only applies to found objects.",
    });
  }
}

export {
  InvalidCustodyStateError,
  NotAFoundObjectError,
  PostNotFoundError,
  InvalidCategoryError,
  InvalidPlaceError,
  ContactRequiredError,
  InvalidPostStatusError,
};
