import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post must be valid"],
    },
    text: {
      type: String,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
