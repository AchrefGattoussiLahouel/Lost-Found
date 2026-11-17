const userService = require("../services/user.service");

const register = async (req, res) => {
    const result = await userService.register(
        req.validated.body
    );

    return res.status(201).json({
        message: "Account created successfully.",
        data: result
    });
};

const login = async (req, res) => {
    const result = await userService.login(
        req.validated.body
    );

    return res.status(200).json({
        message: "Login successful.",
        data: result
    });
};

const getMe = async (req, res) => {
    return res.status(200).json({
        data: {
            user: req.user
        }
    });
};

module.exports = {
    register,
    login,
    getMe
};