const socket = io();

const welcome = document.getElementById("welcome");
const roomForm = welcome.querySelector("#roomName");
const room = document.getElementById("room");
const msgForm = room.querySelector("#msg");
const nameForm = room.querySelector("#name");
const rh3 = room.querySelector("h3");

room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function showRoom(count) {
  rh3.innerText = `Room : ${roomName} (${count})`;
  nameForm.addEventListener("submit", handleNameSubmit);
  msgForm.addEventListener("submit", handleMessageSubmit);
  welcome.hidden = true;
  room.hidden = false;
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = msgForm.querySelector("#msg input");
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You : ${input.value}`);
    input.value = "";
  });
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = roomForm.querySelector("#roomName input");
  roomName = input.value;
  socket.emit("enter_room", roomName, showRoom);
  input.value = "";
}

function handleNameSubmit(event) {
  event.preventDefault();
  const input = nameForm.querySelector("#name input");
  socket.emit("setName", input.value, () => input.value = "");
}

roomForm.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (name, newCount) => {
  rh3.innerText = `Room : ${roomName} (${newCount})`;
  addMessage(`${name} arrived here on this room`);
});

socket.on("goodbye", (name, newCount) => {
  rh3.innerText = `Room : ${roomName} (${newCount})`;
  addMessage(`${name} left`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  if (rooms.length == 0) {
    roomList.innerHTML = "";
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.appendChild(li);
  });
});
