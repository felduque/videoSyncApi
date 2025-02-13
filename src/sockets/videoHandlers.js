export function setupVideoHandlers(socket, io) {
    socket.on("changeVideo", (url) => {
      console.log(url);
      socket.broadcast.emit("changeVideo", url);
    });
  
    socket.on("play", () => {
      console.log("play");
      socket.broadcast.emit("play");
    });
  
    socket.on("pause", () => {
      console.log("pause");
      socket.broadcast.emit("pause");
    });
  
    socket.on("seek", (time) => {
      console.log("seek");
      socket.broadcast.emit("seek", time);
    });
  
    socket.on("updateProgress", (progress) => {
      console.log(progress);
      socket.broadcast.emit("updateProgress", progress);
    });
  }