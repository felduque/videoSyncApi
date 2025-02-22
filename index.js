import server from "./src/app.js";

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`Server runnin on ${port}`);
});
