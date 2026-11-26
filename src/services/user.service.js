import bcrypt from "bcryptjs";
import crypto from "node:crypto";

import User from "../models/user.js";
import { USER_ROLES, USER_STATUS } from "../constants/user.js";
import generateToken from "../utils/jwt.js";
import Errors from "../errors/index.js";
import postService from "./post.service.js";

const BCRYPT_ROUNDS = 12;

const normalizeEmail = (email = "") => email.trim().toLowerCase();

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
    const normalizedEmail = normalizeEmail(userData.email);

    const existingUser = await User.exists({
        email: normalizedEmail,
    });

    if (existingUser) {
        throw new Errors.EmailAlreadyExistsError();
    }

    const hashedPassword = await bcrypt.hash(userData.password, BCRYPT_ROUNDS);

    const user = await User.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: normalizedEmail,
        password: hashedPassword,
        phone: userData.phone || null,
        role: USER_ROLES.MEMBRE,
        status: USER_STATUS.PENDING,
    });

    const token = generateToken(user._id);

    return {
        user: sanitizeUser(user),
        token,
        message: "User registered successfully. Please check your email to activate your account.",
    };
};

const login = async ({ email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
        throw new Errors.InvalidCredentialsError();
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
        throw new Errors.InvalidCredentialsError();
    }

    if (user.status === USER_STATUS.SUSPENDED) {
        throw new Errors.AccountSuspendedError();
    }

    if (user.status !== USER_STATUS.ACTIVE) {
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

    if (!user || user.status !== USER_STATUS.ACTIVE) {
        throw new Errors.NotFoundError();
    }

    const passwordMatches = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!passwordMatches) {
        throw new Errors.InvalidCredentialsError();
    }

    user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

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
    user.password = await bcrypt.hash(crypto.randomUUID(), BCRYPT_ROUNDS);
    user.status = USER_STATUS.DELETED;

    await user.save();
};

const deleteAccount = async (userId) => {
    const user = await User.findById(userId);

    if (!user || user.status === USER_STATUS.DELETED) {
        throw new Errors.NotFoundError();
    }

    await postService.closeAllByOwner(userId);
    await anonymizeUser(user);

    return {
        message: "Account deleted successfully.",
    };
};

// ============================================
// PERSONNEL MANAGEMENT (ADMIN)
// ============================================

// Get personnel with pagination
const getPersonnel = async (page = 1, limit = 10) => {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Number(limit) || 10);
    const skip = (safePage - 1) * safeLimit;

    const filter = {
        role: USER_ROLES.PERSONNEL,
        status: USER_STATUS.ACTIVE,
    };

    const [personnel, total] = await Promise.all([
        User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(safeLimit)
            .lean(),

        User.countDocuments(filter),
    ]);

    return {
        data: personnel,
        pagination: {
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(total / safeLimit),
        },
    };
};

// Create personnel account
const createPersonnel = async (userData) => {
    const normalizedEmail = normalizeEmail(userData.email);

    const existingUser = await User.exists({
        email: normalizedEmail,
    });

    if (existingUser) {
        throw new Errors.EmailAlreadyExistsError();
    }

    const hashedPassword = await bcrypt.hash(userData.password, BCRYPT_ROUNDS);

    const personnel = await User.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: normalizedEmail,
        password: hashedPassword,
        phone: userData.phone || null,
        role: USER_ROLES.PERSONNEL,
        status: USER_STATUS.ACTIVE,
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
        role: USER_ROLES.PERSONNEL,
        status: USER_STATUS.ACTIVE,
    });

    if (!personnel) {
        throw new Errors.NotFoundError();
    }

    if (userData.firstName !== undefined) personnel.firstName = userData.firstName;
    if (userData.lastName !== undefined) personnel.lastName = userData.lastName;
    if (userData.phone !== undefined) personnel.phone = userData.phone || null;
    if (userData.email !== undefined) {
        const normalizedEmail = normalizeEmail(userData.email);
        if (normalizedEmail !== personnel.email) {
            const emailTaken = await User.exists({
                email: normalizedEmail,
                _id: { $ne: personnel._id },
            });
            if (emailTaken) {
                throw new Errors.EmailAlreadyExistsError();
            }
            personnel.email = normalizedEmail;
        }
    }
    if (userData.password) {
        personnel.password = await bcrypt.hash(userData.password, BCRYPT_ROUNDS);
    }

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
        role: USER_ROLES.PERSONNEL,
        status: USER_STATUS.ACTIVE,
    });

    if (!personnel) {
        throw new Errors.NotFoundError();
    }

    await anonymizeUser(personnel);

    return {
        message: "Personnel account deleted successfully.",
    };
};
const banUser = async (targetId, actor, reason) => {
    if (targetId.toString() === actor._id.toString()) {
        throw new Errors.BadRequestError("You cannot ban yourself.");
    }

    const target = await User.findById(targetId);

    if (!target || target.status === USER_STATUS.DELETED) {
        throw new Errors.NotFoundError();
    }

    // Admins can never be banned; only admins can ban personnel.
    if (
        target.role === USER_ROLES.ADMIN ||
        (target.role === USER_ROLES.PERSONNEL && actor.role !== USER_ROLES.ADMIN)
    ) {
        throw new Errors.AuthorizationError();
    }

    if (target.status === USER_STATUS.SUSPENDED) {
        throw new Errors.ConflictError("User is already banned.");
    }

    // Only active accounts can be banned, so unban can safely restore ACTIVE.
    if (target.status !== USER_STATUS.ACTIVE) {
        throw new Errors.BadRequestError("Only active accounts can be banned.");
    }

    target.status = USER_STATUS.BANNED;
    target.bannedAt = new Date();
    target.bannedBy = actor._id;
    target.banReason = reason ?? null;

    await target.save();

    return sanitizeUser(target);
};

const unbanUser = async (targetId) => {
    const target = await User.findById(targetId);

    if (!target || target.status === USER_STATUS.DELETED) {
        throw new Errors.NotFoundError();
    }

    if (target.status !== USER_STATUS.SUSPENDED) {
        throw new Errors.ConflictError("User is not banned.");
    }

    target.status = USER_STATUS.ACTIVE;
    target.bannedAt = null;
    target.bannedBy = null;
    target.banReason = null;

    await target.save();

    return sanitizeUser(target);
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
    banUser,
    unbanUser,
};