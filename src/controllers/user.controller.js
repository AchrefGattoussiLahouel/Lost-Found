import * as userService from "../services/user.service.js";

export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.validated.body;

        const result = await userService.changePassword(
            req.user._id,
            currentPassword,
            newPassword
        );

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const deleteAccount = async (req, res, next) => {
    try {
        const result = await userService.deleteAccount(req.user._id);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getPersonnel = async (req, res, next) => {
    try {
        const { page, limit } = req.validated.query;

        const result = await userService.getPersonnel(page, limit);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const createPersonnel = async (req, res, next) => {
    try {
        const personnel = await userService.createPersonnel(
            req.validated.body
        );

        res.status(201).json({
            message: "Personnel account created successfully",
            data: personnel,
        });
    } catch (error) {
        next(error);
    }
};

export const updatePersonnel = async (req, res, next) => {
    try {
        const personnel = await userService.updatePersonnel(
            req.validated.params.id,
            req.user._id,
            req.validated.body
        );

        res.status(200).json({
            message: "Personnel account updated successfully",
            data: personnel,
        });
    } catch (error) {
        next(error);
    }
};

export const deletePersonnel = async (req, res, next) => {
    try {
        const result = await userService.deletePersonnel(
            req.validated.params.id,
            req.user._id
        );

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
export const banUser = async (req, res, next) => {
    try {
        const user = await userService.banUser(
            req.validated.params.id,
            req.user,
            req.validated.body.reason
        );

        res.status(200).json({ message: "User banned successfully", data: user });
    } catch (error) {
        next(error);
    }
};

export const unbanUser = async (req, res, next) => {
    try {
        const user = await userService.unbanUser(req.validated.params.id);

        res.status(200).json({ message: "User unbanned successfully", data: user });
    } catch (error) {
        next(error);
    }
};