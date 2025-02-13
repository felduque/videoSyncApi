// src/sockets/userHandlers.js
const users = new Set();

export function setupUserHandlers(socket, io) {
  const userId = `User${Math.floor(Math.random() * 1000)}`;
  io.emit("updateUsers", Array.from(users));

  socket.on("disconnect", () => {
    users.delete(userId);
    console.log(userId);
    console.log(Array.from(users));
    io.emit("updateUsers", Array.from(users));
  });

  return userId;
}