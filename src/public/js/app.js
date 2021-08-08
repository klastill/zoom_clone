const socket = new WebSocket(`ws://${window.location.host}`);
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nameForm = document.querySelector("#name");

socket.addEventListener("open", ()=> {
  console.log("connected to server");
});
socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});
socket.addEventListener("close", () => {
  console.log("disconnected from server");
});

function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("message", input.value));
  input.value = "";
}

function handleNameSubmit(event) {
  event.preventDefault();
  const input = nameForm.querySelector("input");
  socket.send(makeMessage("name", input.value));
}

function makeMessage(type, payload) {
  const msg = {type, payload};
  return JSON.stringify(msg);
}

messageForm.addEventListener("submit", handleSubmit);
nameForm.addEventListener("submit", handleNameSubmit);