import { Router } from "express";
import {
  createPost,
  deletePost,
  getAllPost,
  getAllPostBySingleUser,
  getSinglePost,
  updatePost,
} from "../controllers/postController.js";
import fileUpload from "express-fileupload";
const router = Router();

router.get("/", getAllPost);

router.post("/new", fileUpload({ useTempFiles: true }), createPost);

router
  .route("/:id")
  .patch(fileUpload({ useTempFiles: true }), updatePost)
  .delete(deletePost)
  .get(getSinglePost);

// router.patch("/:id", fileUpload({ useTempFiles: true }), updatePost);

// router.delete("/:id", deletePost);

// router.get("/:id", getSinglePost);

router.get("/:id/allpost", getAllPostBySingleUser);

export default router;
