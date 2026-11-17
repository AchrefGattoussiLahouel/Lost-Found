
const mongoose = require("mongoose");
const ROLES = require("../constants/roles");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false
        },
        phone: {
            type: String,
            trim: true,
            default: null
        },
        role: {
            type: String,
            enum: Object.values(ROLES),
            default: ROLES.MEMBRE,
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
