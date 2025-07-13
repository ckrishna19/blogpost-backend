import { ApiError, ApiResponse, asyncHandler } from "../utils/asyncResponse.js";
import Post from "../modal/postModal.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const safeData = ["firstName", "lastName", "email", "photoUrl"];

export const createPost = asyncHandler(async (req, res) => {
  const text = req?.body.text;
  const image = req?.files?.image;

  if (!req.user) {
    throw new ApiError("Unauthorized user", 403);
  }

  let result;

  if (!!image) {
    const access = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    if (!access.includes(image.mimetype)) {
      fs.unlink(image.tempFilePath, (err) => {
        if (err) throw new Error(err);
        console.log("successfully deleted");
      });
      throw new ApiError("Invalid image pattern", 403);
    }

    result = await cloudinary.uploader.upload(image.tempFilePath, {
      folder: "Blogs",
    });
    fs.unlink(image.tempFilePath, () => {
      console.log("successfully deleted");
    });
  }

  const newPost = new Post({
    text: text ?? undefined,
    image: { url: result?.secure_url, publicId: result?.public_id },
    postedBy: req.user._id,
  });

  await newPost.save();
  const populated = await newPost.populate("postedBy", safeData);
  const data = { ...populated._doc, image: result?.secure_url };

  return res
    .status(201)
    .json(new ApiResponse(201, "post created successfully", true, data));
});

export const updatePost = asyncHandler(async (req, res) => {
  const { text, removeImage } = req?.body;

  const image = req?.files?.image;

  const access = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  if (!access.includes(image.mimetype)) {
    fs.unlink(image?.tempFilePath, (err) => {
      if (err) throw new ApiError(err);
      console.log("image deleted successfully");
    });
    throw new ApiError("Invalid image pattern", 403);
  }
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new ApiError("There is not such post", 403);
  }

  if (text) post.text = text;
  if (removeImage === "true") {
    // delete image from post
    await cloudinary.uploader.destroy(post?.image?.publicId);

    post.image = {};
  }

  if (!!image) {
    if (post?.image?.publicId) {
      await cloudinary.uploader.destroy(post?.image?.publicId);
    }
    const result = await cloudinary.uploader.upload(image?.tempFilePath, {
      folder: "Blogs",
    });

    post.image = {
      url: result?.secure_url,
      publicId: result?.public_id,
    };
  }

  if (!!image?.tempFilePath) {
    fs.unlink(image?.tempFilePath, (err) => {
      if (err) throw new Error(err);
      console.log("temp file deleted....");
    });
  }
  const update = {
    ...(await post.save().then((p) => p.populate("postedBy", safeData)))._doc,
    image: post.image.url || null,
  };

  //  const populated = await update.populate("postedBy", safeData);
  //  const refinedDocs = { ...populated._doc, image: populated.image.url || null };
  return res
    .status(201)
    .json(new ApiResponse(201, "updated successfully", true, update));
});

export const deletePost = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Unauthorized request ", 403);
  }
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError("There is not such post", 403);
  }
  if (post.postedBy?.toString() !== req.user._id?.toString()) {
    throw new ApiError("You are not allowed to delete this post.", 403);
  }

  if (post?.image?.publicId) {
    await cloudinary.uploader.destroy(post?.image?.publicId);
  }
  await post.deleteOne();

  return res
    .status(201)
    .json(new ApiResponse(201, "delete success", true, null));
});

export const getSinglePost = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Un authorized request", 403);
  }
  const singlePost = await Post.findById(req.params.id);
  if (!singlePost) {
    throw new ApiError("There is not a such post");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, "post found..", true, singlePost));
});

export const getAllPostBySingleUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Un authorized request", 403);
  }
  const allPostBySingleUser = await Post.find({ postedBy: req.params.id });

  if (allPostBySingleUser.length === 0) {
    throw new ApiError("This user did not post yet", 403);
  }
  return res
    .status(201)
    .json(
      new ApiResponse(201, "All post by single user", true, allPostBySingleUser)
    );
});

export const getAllPost = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Unauthorized request ", 403);
  }

  const allPost = await Post.aggregate([
    { $match: {} },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "postId",
        as: "comments",
      },
    },
    {
      $addFields: {
        commentCount: { $size: "$comments" },
      },
    },
    {
      $project: {
        comments: 0,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "postedBy",
        foreignField: "_id",
        as: "postedBy",
      },
    },
    { $unwind: "$postedBy" },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "postId",
        as: "likes",
      },
    },
    {
      $addFields: {
        likeCount: {
          $size: "$likes",
        },
        likedByIds: {
          $map: {
            input: "$likes",
            as: "like",
            in: "$$like.likedBy",
          },
        },
      },
    },
    { $project: { likes: 0 } },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "like",
      },
    },
    {
      $project: {
        commentCount: 1,
        likeCount: 1,
        createdAt: 1,
        text: 1,
        image: "$image.url",
        likeCount: 1,
        likedByIds: 1,

        // explicitly include these user fields
        "postedBy.firstName": 1,
        "postedBy.lastName": 1,
        "postedBy.email": 1,
        "postedBy.photoUrl": 1,
        "postedBy._id": 1,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  if (allPost.length === 0) {
    throw new ApiError("There is not any post yet", 403);
  }
  return res
    .status(201)
    .json(new ApiResponse(201, "get all post", true, allPost));
});
