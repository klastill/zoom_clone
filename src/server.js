import express from "express";
import http from "http";
import SocketIO from "socket.io";

const app = express();
const port =  3000;
const handleListener = () => console.log(`Listening on http://localhost:${port}`);

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));

const server = http.createServer(app);
const ioServer = SocketIO(server);

ioServer.on("connection", (socket) => {
  socket.emit("enter_room", (msg) => {
    console.log(msg);
  });
});

server.listen(port, handleListener);