import { HydratedDocument, Model, Schema, Types, model } from "mongoose";
import { GenderEnum, RoleEnum } from "../../Utils/enums/user.enum";
import { generateHash } from "../../Utils/security/hash";
import { encrypt } from "../../Utils/security/encryption";

export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username?: string;

  email: string;
  confirmEmailOTP: string;
  confirmAt: Date;

  password: string;
  resetPasswordOTP: string;

  phone: string;
  address?: string;

  gender: GenderEnum;
  role: RoleEnum;

  friends?: Types.ObjectId[];
  blockedUser?: Types.ObjectId[];
  deviceTokens?: string[];
  lastSeen: Date;
  notificationEnabled?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export const userSchema = new Schema<IUser>(
  {
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
    phone: {
      type: String,
      required: true,
    },
    address: String,
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.FEMALE,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    blockedUser: [{ type: Schema.Types.ObjectId, ref: "User" }],
    deviceTokens: [{ type: String }],
    notificationEnabled: { type: Boolean, default: true },
    lastSeen: { type: Date },
  },
  {
    validateBeforeSave: true,
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform(doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.confirmEmailOTP;
        delete ret.resetPasswordOTP;
        return ret;
      },
    },
  },
);
userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, ...rest] = value.trim().split(/\s+/);
    this.set({ firstName, lastName: rest.join(" ") });
  })
  .get(function (this: IUser) {
    return `${this.firstName} ${this.lastName}`;
  });
userSchema.pre("validate", function () {
  this.email = this.email.toLowerCase().trim();
});
userSchema.pre("save", async function (this: HUserDocument) {
  if (this.isModified("password")) {
    this.password = await generateHash(this.password);
  }
  if (this.isModified("phone")) {
    this.phone = await encrypt(this.phone);
  }
});

export const UserModel: Model<IUser> = model<IUser>("User", userSchema);

export type HUserDocument = HydratedDocument<IUser>;
