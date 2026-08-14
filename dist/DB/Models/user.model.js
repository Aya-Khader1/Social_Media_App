"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.userSchema = void 0;
const mongoose_1 = require("mongoose");
const user_enum_1 = require("../../Utils/enums/user.enum");
exports.userSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 2,
        maxlength: 25,
    },
    lastName: {
        type: String,
        required: true,
        minLength: 2,
        maxlength: 25,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    confirmEmailOTP: String,
    confirmAt: Date,
    password: { type: String, required: true },
    resetPasswordOTP: String,
    phone: String,
    address: String,
    gender: {
        type: String,
        enum: Object.values(user_enum_1.GenderEnum),
        default: user_enum_1.GenderEnum.FEMALE,
    },
    role: {
        type: String,
        enum: Object.values(user_enum_1.RoleEnum),
        default: user_enum_1.RoleEnum.USER,
    },
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
        virtuals: true,
        transform(doc, ret) {
            delete ret.password;
            delete ret.confirmEmailOTP;
            delete ret.resetPasswordOTP;
            return ret;
        },
    },
});
exports.userSchema
    .virtual("username")
    .set(function (value) {
    const [firstName, ...rest] = value.trim().split(/\s+/);
    this.set({ firstName, lastName: rest.join(" ") });
})
    .get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.UserModel = (0, mongoose_1.model)("User", exports.userSchema);
