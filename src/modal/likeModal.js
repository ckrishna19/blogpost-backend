import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
const Like = mongoose.model("Like", likeSchema);

export default Like;
