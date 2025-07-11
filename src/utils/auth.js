import jwt from "jsonwebtoken";
import { ApiError, asyncHandler } from "./asyncResponse.js";
import User from "../modal/userModal.js";

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "somethingsecret", {
    expiresIn: "1d",
  });
};

export const authUser = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token?.split(" ")[1];

  if (!token) {
    throw new ApiError("Un authorized request", 403);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError("This user does not exist ", 404);
  }
  req.user = user;
  next();
});
