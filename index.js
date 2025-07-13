import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./src/routes/userRoute.js";
import commentRoute from "./src/routes/commentRoute.js";
import mongoose from "mongoose";
import postRoute from "./src/routes/postRoute.js";
import { authUser } from "./src/utils/auth.js";
import likeRoute from "./src/routes/likeRoute.js";
import { v2 as cloudinary } from "cloudinary";
import connectSocket from "./src/utils/socket.js";

// middleware configuration
dotenv.config();
const app = express();
const server = http.createServer(app);
//connectSocket(server);

app.use(
  cors({
    origin:
      process.env.NODE_ENV_ORG === "dev"
        ? "http://localhost:5173"
        : "https://blogpost-frontend-eta.vercel.app",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
cloudinary.config({
  api_secret: process.env.CLOUDINARY_API_SECRET,
  api_key: process.env.CLOUDINARY_API_KEY,
  cloud_name: process.env.CLOUDINARY_CLIENT_ID,
});
const port = process.env.PORT || 5002;

app.use("/api/user", userRouter);
app.use(authUser);
app.use("/api/post", postRoute);
app.use("/api/comment", commentRoute);
app.use("/api/like", likeRoute);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`database connected..`);

    server.listen(port, () => {
      console.log(`server is listining at port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
