import { Server } from "socket.io";
const connectSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
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
