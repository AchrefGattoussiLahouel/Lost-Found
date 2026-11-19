import bcrypt from "bcryptjs";
import crypto from "node:crypto";

import User from "../models/user.js";
import ROLES from "../constants/roles.js";
import { STATUS } from "../constants/status.js";
import generateToken from "../utils/jwt.js";
import Errors from "../errors/index.js";

const sanitizeUser = (user) => {
    const userObject = user.toObject
        ? user.toObject()
        : { ...user };

    delete userObject.password;
    delete userObject.__v;

    return userObject;
};

// ============================================
// AUTHENTICATION
// ============================================

const register = async (userData) => {
    const existingUser = await User.exists({
        email: userData.email,
    });

    if (existingUser) {
        throw new Errors.EmailAlreadyExistsError();
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await User.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone || null,
        role: ROLES.MEMBRE,
        status: STATUS.PENDING,
    });

    const token = generateToken(user._id);

    return {
        user: sanitizeUser(user),
        token,
        message: "User registered successfully. Please check your email to activate your account.",
    };
};

const login = async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new Errors.InvalidCredentialsError();
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
        throw new Errors.InvalidCredentialsError();
    }

    if (user.status !== STATUS.ACTIVE) {
        throw new Errors.AccountNotActiveError();
    }

    const token = generateToken(user._id);

    return {
        user: sanitizeUser(user),
        token,
    };
};

// ============================================
// ACCOUNT MANAGEMENT
// ============================================

// Change password
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId).select("+password");

    if (!user || user.status !== STATUS.ACTIVE) {
        throw new Errors.NotFoundError();
    }

    const passwordMatches = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!passwordMatches) {
        throw new Errors.InvalidCredentialsError();
    }

    user.password = await bcrypt.hash(newPassword, 12);

    await user.save();

    return {
        message: "Password changed successfully.",
    };
};

// Anonymize an account
const anonymizeUser = async (user) => {
    user.firstName = "Deleted";
    user.lastName = "User";
    user.email = `deleted_${user._id}_${crypto.randomUUID()}@deleted.invalid`;
    user.phone = null;
    user.password = await bcrypt.hash(crypto.randomUUID(), 12);
    user.status = STATUS.DELETED;

    await user.save();
};

// Delete authenticated user's account
const deleteAccount = async (userId) => {
    const user = await User.findById(userId);

    if (!user || user.status === STATUS.DELETED) {
        throw new Errors.NotFoundError();
    }

    /*
     * TODO: Integrate with B's declaration service.
     *
     * await declarationService.closeAllByOwner(userId);
     *
     * Close declarations successfully before anonymizing the user.
     */

    await anonymizeUser(user);

    return {
        message: "Account deleted successfully.",
    };
};

// ============================================
// PERSONNEL MANAGEMENT (ADMIN)
// ============================================

// Get personnel with pagination
const getPersonnel = async (page, limit) => {
    const skip = (page - 1) * limit;

    const filter = {
        role: ROLES.PERSONNEL,
        status: STATUS.ACTIVE,
    };

    const [personnel, total] = await Promise.all([
        User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        User.countDocuments(filter),
    ]);

    return {
        data: personnel,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// Create personnel account
const createPersonnel = async (userData) => {
    const existingUser = await User.exists({
        email: userData.email,
    });

    if (existingUser) {
        throw new Errors.EmailAlreadyExistsError();
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const personnel = await User.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone || null,
        role: ROLES.PERSONNEL,
        status: STATUS.ACTIVE,
    });

    return sanitizeUser(personnel);
};

// Update personnel account
const updatePersonnel = async (personnelId, adminId, userData) => {
    if (personnelId.toString() === adminId.toString()) {
        throw new Errors.BadRequestError(
            "You cannot modify your own account through personnel management."
        );
    }

    const personnel = await User.findOne({
        _id: personnelId,
        role: ROLES.PERSONNEL,
        status: STATUS.ACTIVE,
    });

    if (!personnel) {
        throw new Errors.NotFoundError();
    }

    Object.assign(personnel, userData);

    await personnel.save();

    return sanitizeUser(personnel);
};

// Delete personnel account
const deletePersonnel = async (personnelId, adminId) => {
    if (personnelId.toString() === adminId.toString()) {
        throw new Errors.BadRequestError(
            "You cannot delete your own account through personnel management."
        );
    }

    const personnel = await User.findOne({
        _id: personnelId,
        role: ROLES.PERSONNEL,
        status: STATUS.ACTIVE,
    });

    if (!personnel) {
        throw new Errors.NotFoundError();
    }

    await anonymizeUser(personnel);

    return {
        message: "Personnel account deleted successfully.",
    };
};

export default {
    register,
    login,
    changePassword,
    deleteAccount,
    getPersonnel,
    createPersonnel,
    updatePersonnel,
    deletePersonnel,
};