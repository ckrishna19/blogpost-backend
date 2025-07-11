import { Router } from "express";
import {
  getAllLike,
  LikePost,
  unLikePost,
} from "../controllers/LikeController.js";

const router = Router();

router.post("/new", LikePost);
router.delete("/delete/:id", unLikePost);
router.get("/:id", getAllLike);

export default router;
