import server from "./src/app.js";

const port = process.env.PORT || 3001;

server.listen(process.env.PORT, () => {
  console.log(`Server runnin on ${process.env.PORT}`);
});
