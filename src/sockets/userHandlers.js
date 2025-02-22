// src/sockets/userHandlers.js
const users = new Set();

export function setupUserHandlers(socket, io) {
  const userId = `User${Math.floor(Math.random() * 1000)}`;
  users.add(userId);
  io.emit("updateUsers", Array.from(users));

  socket.on("disconnect", () => {
    users.delete(userId);
    io.emit("updateUsers", Array.from(users));
  });

  return userId;
}