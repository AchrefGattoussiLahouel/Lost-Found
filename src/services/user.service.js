const bcrypt = require("bcryptjs");

const User = require("../models/user");
const ROLES = require("../constants/roles");
const { generateToken } = require("../utils/jwt");

const {
    EmailAlreadyExistsError,
    InvalidCredentialsError
} = require("../errors");

const sanitizeUser = (user) => {
    const userObject = user.toObject
        ? user.toObject()
        : { ...user };

    delete userObject.password;
    delete userObject.__v;

    return userObject;
};

const register = async (userData) => {
    const existingUser = await User.exists({
        email: userData.email
    });

    if (existingUser) {
        throw new EmailAlreadyExistsError();
    }

    const hashedPassword = await bcrypt.hash(
        userData.password,
        12
    );

    const user = await User.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone || null,
        role: ROLES.MEMBRE
    });

    const token = generateToken(user._id);

    return {
        user: sanitizeUser(user),
        token
    };
};

const login = async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new InvalidCredentialsError();
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatches) {
        throw new InvalidCredentialsError();
    }

    const token = generateToken(user._id);

    return {
        user: sanitizeUser(user),
        token
    };
};

module.exports = {
    register,
    login
};