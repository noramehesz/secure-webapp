import express from "express";
import { createServer } from "http";
import socketIo from "socket.io";

const port = process.env.PORT || 4001;
import index from "./routes/index.js";

const app = express();
app.use(index);

const server = createServer(app);

const io = socketIo(server);

let clients = [];
let encryptedData = "";

io.on("connection", (socket) => {
  clients.push(socket);
  console.log(`New client connected ${clients.length}`);

  socket.on("new message", (data) => {
    encryptedData = data;
    console.log(data);
    socket.broadcast.emit("new message", data);
    socket.emit("get message", data);
  });

  socket.on("get data", () => {
    socket.e;
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
