import { Router } from "express";
import {
  getMyProfile,
  getUserList,
  loginUser,
  logOut,
  registerUser,
  updatePassword,
  updateProfileImage,
} from "../controllers/userController.js";
import { authUser } from "../utils/auth.js";
import fileUpload from "express-fileupload";
const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.use(authUser);

router.get("/me", getMyProfile);

router.patch("/update-password", updatePassword);

router.patch(
  "/update-image",
  authUser,
  fileUpload({ useTempFiles: true }),
  updateProfileImage
);

router.get("/userlist", getUserList);

router.post("/logout", logOut);

export default router;
