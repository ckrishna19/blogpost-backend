import { Router } from "express";
import {
  deleteComment,
  getAllComment,
  updateComment,
  writeComment,
} from "../controllers/commentController.js";
const router = Router();

router.post("/new", writeComment);

router.get("/all-comment/:id", getAllComment);

router.patch("/:id", updateComment);

router.delete("/:id", deleteComment);

export default router;
