import Comment from "../modal/commentModal.js";
import Post from "../modal/postModal.js";
import { asyncHandler, ApiError, ApiResponse } from "../utils/asyncResponse.js";

const safeData = ["firstName", "lastName", "email", "photoUrl"];

export const writeComment = asyncHandler(async (req, res) => {
  const { postId, text } = req.body;

  if (!req.user) {
    throw new ApiError("Unauthorized request..", 403);
  }
  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError("There is not such post..", 403);
  }
  const newComment = new Comment({ postId, text, commentedBy: req.user._id });
  await newComment.save();
  const populated = await newComment.populate("commentedBy", safeData);
  return res
    .status(201)
    .json(new ApiResponse(201, "commented successfully", true, populated));
});

export const updateComment = asyncHandler(async (req, res) => {
  const { postId, text } = req.body;
  if (!req.user) {
    throw new ApiError("Unauthorized request", 403);
  }
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    throw new ApiError("There is not such comment..", 403);
  }
  const post = await Post.findById(comment.postId);
  if (!post) {
    throw new ApiError("There is not post related to this comment", 403);
  }
  if (req.user._id.toString() !== comment.commentedBy.toString()) {
    throw new ApiError("You are not allowed to update post..", 403);
  }
  const update = await Comment.findByIdAndUpdate(
    comment._id,
    { $set: { text: text } },
    { new: true, runValidators: true }
  );
  return res
    .status(201)
    .json(new ApiResponse(201, "updated successfully", true, update));
});

export const deleteComment = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Unauthorized request", 403);
  }
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    throw new ApiError("There is not such comment");
  }
  const post = await Post.findById(comment.postId);
  if (!post) {
    throw new ApiError("There is not such post related to this comment.", 403);
  }

  const access = [post.postedBy.toString(), comment.commentedBy?.toString()];
  if (!access.includes(req.user._id?.toString())) {
    throw new ApiError("You are not allowed to delete this comment", 403);
  }

  await Comment.findByIdAndDelete(req.params.id);
  return res
    .status(201)
    .json(new ApiResponse(201, "delete success", true, null));
});

export const getAllComment = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Unauthorized request", 403);
  }
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new ApiError("There is not such post", 403);
  }

  const allComment = await Comment.find({ postId: post._id })
    .populate("commentedBy", safeData)
    .sort({ createdAt: -1 });

  return res
    .status(201)
    .json(new ApiResponse(201, "found all comment", true, allComment));
});
