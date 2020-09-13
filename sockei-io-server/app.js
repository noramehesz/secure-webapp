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
let urlToKey = "";

io.on("connection", (socket) => {
  clients.push(socket);
  console.log(`New client connected ${clients.length}`);

  socket.on("new message", (data) => {
    encryptedData = data;
    socket.broadcast.emit("new message", data);
  });

  socket.on("get data", () => {
    io.to(socket.id).emit("get data", encryptedData);
  });

  socket.on("key event", (data) => {
    if (data) {
      urlToKey = data;
    } else {
      io.to(socket.id).emit("key event", data);
    }
  });

  socket.on("session is ready", () => {
    console.log("session is ready event active");
    socket.broadcast.emit("session is ready");
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
