import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      trim: true,
    },
    image: {
      url: String,
      publicId: String,
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
