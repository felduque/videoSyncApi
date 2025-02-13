// src/sockets/index.js
import { Server } from "socket.io";
import { setupVideoHandlers } from "./videoHandlers.js";
import { setupUserHandlers } from "./userHandlers.js";


export function setupSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected");

    const userId = setupUserHandlers(socket, io);
    setupVideoHandlers(socket, io);

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
}