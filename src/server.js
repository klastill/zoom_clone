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

function handleConnection(socket) {
  console.log(socket);
} 

wss.on("connection", handleConnection);

server.listen(port, handleListener);

// app.listen(port, handleListener);