import AppError from "./AppError.js";

export class DeclarationNotFoundError extends AppError {
  constructor() {
    super({ status: 404, code: "DECLARATION_NOT_FOUND", message: "Declaration not found." });
  }
}

export class InvalidCategoryError extends AppError {
  constructor() {
    super({
      status: 422, code: "INVALID_CATEGORY", message: "Category does not exist or is inactive.",
      details: { category: [{ code: "INVALID_CHOICE", params: {} }] },
    });
  }
}

export class InvalidPlaceError extends AppError {
  constructor() {
    super({
      status: 422, code: "INVALID_PLACE", message: "Place does not exist or is inactive.",
      details: { place: [{ code: "INVALID_CHOICE", params: {} }] },
    });
  }
}

export class ContactRequiredError extends AppError {
  constructor() {
    super({
      status: 422, code: "CONTACT_REQUIRED", message: "A contact is required when no user is given.",
      details: { contact: [{ code: "FIELD_REQUIRED", params: {} }] },
    });
  }
}