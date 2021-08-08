import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();
const port =  3000;
const handleListener = () => console.log(`Listening on http://localhost:${port}`);

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  console.log("connected to browser");
  socket.on("message", (message) => {
    sockets.forEach((socket) => {
      socket.send(message.toString("utf-8"));
    });
  });
  socket.on("close", () => console.log("disconnected from browser"));
});

server.listen(port, handleListener);