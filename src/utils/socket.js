import { Server } from "socket.io";
const connectSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin:
        process.env.NODE_ENV_ORG === "dev"
          ? "http://localhost:5173"
          : "https://blogpost-frontend-eta.vercel.app",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("write-comment", (data) => {
      io.emit("rcv-comment", data);
    });

    socket.on("disconnect", () => {
      console.log(`socket disconnect ${socket.id}`);
    });
  });
};

export default connectSocket;
