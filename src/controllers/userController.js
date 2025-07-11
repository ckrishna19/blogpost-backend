import User from "../modal/userModal.js";
import { asyncHandler, ApiResponse, ApiError } from "../utils/asyncResponse.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/auth.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const salt = 10;

export const registerUser = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, gender } = req.body;

  if (!email || !password || !firstName || !lastName) {
    throw new ApiError("All fields are mandetory..", 403);
  }

  const registeredUser = await User.findOne({ email });
  if (registeredUser) {
    throw new ApiError("Email Already registered..", 403);
  }
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
  });
  await newUser.save();
  const token = generateToken({ id: newUser._id });

  return res
    .status(201)
    .cookie("token", `Bearer ${token}`, {
      httpOnly: true,
      secure: true,
    })
    .json(
      new ApiResponse(201, "user created succesfully", true, {
        ...newUser._doc,
        password: "",
      })
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError("This email did not registered yet", 403);
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError("Invalid credentials..", 403);
  }
  const token = generateToken({ id: user._id });
  return res
    .status(201)
    .cookie("token", `Bearer ${token}`, {
      httpOnly: true,
      secure: true,
    })
    .json(
      new ApiResponse(201, "Login success", true, {
        ...user._doc,
        password: "",
      })
    );
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!req?.user) {
    throw new ApiError("Invalid credentials", 403);
  }

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    throw new ApiError("Incorrect old password", 403);
  }
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  console.log(hashedPassword);

  const updatePassword = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        password: hashedPassword,
      },
    },
    { new: true, runValidators: true }
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, "password update successfully", true, updatePassword)
    );
});

export const logOut = asyncHandler(async (req, res) => {
  if (!req?.user) {
    throw new ApiError("User not logged in yet....", 403);
  }
  return res
    .status(203)
    .clearCookie("token")
    .json(new ApiResponse(201, "loggout success", true, null));
});

export const getUserList = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Unauthorized request", 403);
  }
  const userList = await User.find({ _id: { $ne: req.user._id } }).limit(2);
  return res
    .status(201)
    .json(new ApiResponse(201, "successfully found", true, userList));
});

export const updateProfileImage = asyncHandler(async (req, res) => {
  const image = req?.files?.image;
  if (!image) {
    throw new ApiError("No photos.. please uplaod one");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError("There is not such user.", 403);
  }
  const access = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  if (!access.includes(image.mimetype)) {
    throw new ApiError("Invalid image pattern", 403);
  }
  if (user?.photoUrl?.publicId) {
    await cloudinary.uploader.destroy(user?.photoUrl?.publicId);
    user.photoUrl = {};
  }

  const result = await cloudinary.uploader.upload(image?.tempFilePath, {
    folder: "Blogs",
  });

  fs.unlink(image?.tempFilePath, (err) => {
    if (err) throw new ApiError(err);
    console.log("image deleted successfully");
  });

  const updateImage = await User.findByIdAndUpdate(
    user?._id,
    {
      $set: {
        photoUrl: { url: result?.secure_url, publicId: result.public_id },
      },
    },
    { new: true, runValidators: true }
  );
  return res
    .status(201)
    .json(new ApiResponse(201, "updated profile image", true, updateImage));
});

export const getMyProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Unauthorized request", 403);
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError("This user is not registered or not in system", 403);
  }
  return res
    .status(201)
    .json(new ApiResponse(201, "found my profile", true, user));
});
