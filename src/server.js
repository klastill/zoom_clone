import express from "express";
import http from "http";
import {Server} from "socket.io";
import {instrument} from "@socket.io/admin-ui";

const app = express();
const port =  3000;
const handleListener = () => console.log(`Listening on http://localhost:${port}`);

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));

const httpServer = http.createServer(app);
const ioServer = new Server(httpServer, {
  cors: {
    origin: ["http://admin.socket.io"],
    credentials: true,
  },
});
instrument(ioServer, {
  auth: false
});

function publicRooms() {
  const {
    sockets: {
      adapter: {sids, rooms},
    },
  } = ioServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return ioServer.sockets.adapter.rooms.get(roomName)?.size;
}

ioServer.on("connection", (socket) => {
  socket["name"] = "Undefined";
  socket.onAny((event) => {
    console.log(`socket event : ${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done(countRoom(roomName));
    socket.to(roomName).emit("welcome", socket.name, countRoom(roomName));
    ioServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("goodbye", socket.name, countRoom(room) - 1);
    });
  });
  socket.on("disconnect", () => {
    ioServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.name} : ${msg}`);
    done();
  });
  socket.on("setName", (name) => {
    socket["name"] = name;
  })
});

httpServer.listen(port, handleListener);