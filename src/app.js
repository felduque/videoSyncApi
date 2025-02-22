import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import { createServer } from "http";
import "dotenv/config";
import { setupSockets } from "./sockets/index.js";
import cookieParser from "cookie-parser";

import users from "./routes/user.routes.js";
import room from "./routes/rooms.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const server = createServer(app);

setupSockets(server)

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.ORIGIN_DOMAIN);
  res.header(
    "Access-Control-Allow-Headers",
    "x-auth-token, Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, DELETE, PATCH"
  );
  next();
});
app.use("/api", users);
app.use("/api", room);
app.use(errorHandler)

// Manejador de errores para promesas no manejadas
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});


// Manejador de errores para excepciones no capturadas
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

export default server;
