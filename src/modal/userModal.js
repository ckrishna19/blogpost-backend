import mongoose from "mongoose";
import validator from "validator";
import { ApiError } from "../utils/asyncResponse.js";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please email should not be empty"],
      unique: true,
      lowercase: true,
      trim: [true, "email doesnot have white spaces"],
      validate: {
        validator: function (email) {
          return validator.isEmail(email);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      select: false,
      minLength: [8, "Password must have at least 8 character"],
      required: [true, "Password should not be empty"],
      trim: true,
      validate: {
        validator: function (password) {
          return validator.isStrongPassword(password);
        },
        message: `This password is weak.. 
        password must have at least 8 character.
        must contain Capiital letter.
        must contain small letter and numeric value,
        must contained special character like @#$%& ect..

        `,
      },
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    photoUrl: {
      url: {
        type: String,
        default:
          "https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png",
      },
      publicId: { type: String },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      validate: function (gender) {
        const validGender = ["male", "female", "other"].includes(gender);
        if (!validGender) {
          throw new ApiError("Invalid gender type", 403);
        }
      },
    },
    profession: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);

export default User;
