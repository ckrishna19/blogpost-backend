import { Server } from "socket.io";
const connectSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "https://blogpost-frontend-coral.vercel.app",
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
