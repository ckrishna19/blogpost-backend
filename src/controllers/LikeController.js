import Like from "../modal/likeModal.js";
import Post from "../modal/postModal.js";
import { asyncHandler, ApiError, ApiResponse } from "../utils/asyncResponse.js";

export const LikePost = asyncHandler(async (req, res) => {
  const { postId } = req.body;

  if (!req.user) {
    throw new ApiError("Unauthorized request....", 403);
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError("There is not such post");
  }
  const like = new Like({ postId, likedBy: req.user._id });
  await like.save();
  return res
    .status(201)
    .json(new ApiResponse(201, "Liked success", true, like));
});

export const unLikePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  if (!req.user) {
    throw new ApiError("Unauthorized request..");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError("There is not such post");
  }

  const likedPost = await Like.findOne({
    $and: [{ postId }, { likedBy: req.user._id }],
  });
  if (!likedPost) {
    throw new ApiError("You did not like that post yet", 403);
  }

  const unLikePost = await Like.findByIdAndDelete(likedPost?._id);
  return res
    .status(201)
    .json(new ApiResponse(201, "unLike success", true, unLikePost));
});

export const getAllLike = asyncHandler(async (req, res) => {
  const likeList = await Like.find({ postId: req.params.id });
  return res
    .status(201)
    .json(new ApiResponse(201, "fetch like list", true, likeList));
});
