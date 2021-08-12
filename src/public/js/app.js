const socket = io();

const welcome = document.getElementById("welcome");
const roomForm = welcome.querySelector("#roomForm");

const call = document.getElementById("call");
const myVideo = document.getElementById("myVideo");
const micBtn = document.getElementById("mic");
const micSelect = document.getElementById("mics");
const camBtn = document.getElementById("camera");
const camSelect = document.getElementById("cameras");
const opVideo = document.getElementById("opVideo");

let myStream;
let roomName;
let myPeerConnection;
let isMicOff = false;
let isCamOff = false;

call.hidden = true;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(device => device.kind == "videoinput");
    const currentCam = myStream.getVideoTracks()[0];
    cameras.forEach(cam => {
      const option = document.createElement("option");
      option.value = cam.deviceId;
      option.innerText = cam.label;
      if (currentCam.label == cam.label) {
        option.selected = true;
      }
      camSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
async function getMics() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const mics = devices.filter(device => device.kind == "audioinput");
    const currentMic = myStream.getAudioTracks()[0];
    mics.forEach(mic => {
      const option = document.createElement("option");
      option.value = mic.deviceId;
      option.innerText = mic.label;
      if (currentMic.label == mic.label) {
        option.selected = true;
      }
      micSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(micId, camId) {
  const initialConstrains = {
    audio: true,
    video: {facingMode: "user"},
  };
  const changeConstrains  = {
    audio: {deviceId: {exact: micId}},
    video: {deviceId: {exact: camId}},
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      micId ? changeConstrains : initialConstrains
    );
    myVideo.srcObject = myStream;
    if (!micId) {
      await getMics();
      await getCameras();
    }
  } catch (e) { 
    console.log(e);
  }
}

async function makeCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

function makeConnection() { 
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream.getTracks().forEach((track) => {
    myPeerConnection.addTrack(track, myStream);
  });
}

async function handleRoomSubmit(event) {
  event.preventDefault();
  const input = roomForm.querySelector("input");
  await makeCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

function handleMicBtn() {
  myStream.getAudioTracks().forEach(track => {
    track.enabled = !track.enabled;
  });
  if (!isMicOff) {
    micBtn.innerText = "Mic on";
  } else {
    micBtn.innerText = "Mic off";
  }
  isMicOff = !isMicOff;
}
function handleCamBtn() {
  myStream.getVideoTracks().forEach(track => {
    track.enabled = !track.enabled;
  });
  if (!isCamOff) {
    camBtn.innerText = "Cam on";
  } else {
    camBtn.innerText = "Cam off";
  }
  isCamOff = !isCamOff;
}

async function handleMicChange() {
  await getMedia(micSelect.value, camSelect.value);
  if (myPeerConnection) {
    const audioTrack = myStream.getAudioTracks()[0];
    const audioSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "audio");
    audioSender.replaceTrack(audioTrack);
  }
  micBtn.innerText = "Mic off";
  isMicOff = false;
}
async function handleCamChange() {
  await getMedia(micSelect.value, camSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
  camBtn.innerText = "Cam off";
  isCamOff = false;
}

function handleIce(data) {
  socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
  opVideo.srcObject = data.stream;
}

socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
});

socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  myPeerConnection.addIceCandidate(ice);
});

roomForm.addEventListener("submit", handleRoomSubmit);
micBtn.addEventListener("click", handleMicBtn);
camBtn.addEventListener("click", handleCamBtn);
micSelect.addEventListener("input", handleMicChange);
camSelect.addEventListener("input", handleCamChange);