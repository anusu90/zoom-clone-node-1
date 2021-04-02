const videoGrid = document.getElementById("video-grid")
const myVideo = document.createElement("video")
myVideo.muted = true;


var socket = io(); // connection to socket IO server has been made here.
let myVideoStream, myDisplayStream;

const peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3030"
});

connectToNewUser = (userID, stream) => {
    console.log("New User Joined with ID: ", userID)
    const video = document.createElement("video")
    const call = peer.call(userID, stream)
    call.on("stream", (remoteStream) => {
        console.log("shivay", remoteStream)
        addVideoStream(video, remoteStream)
    }, (error) => {
        console.log(error)
    })
}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream
    addVideoStream(myVideo, myVideoStream)

    peer.on("call", call => {
        call.answer(myVideoStream);
        const video = document.createElement("video")
        call.on("stream", (remoteStream) => {
            console.log("bholenath", remoteStream)
            addVideoStream(video, remoteStream)
        }, (error) => {
            console.log(error)
        })
    })

    socket.on("user-connected", (userID) => {
        console.log("socket.on-user-connected")
        connectToNewUser(userID, stream)
    })

}).catch(err => console.log(err))

async function startCamera() {

}


async function startScreenShare() {
    myDisplayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
            cursor: 'always' | 'motion' | 'never',
            displaySurface: 'application' | 'browser' | 'monitor' | 'window'
        }
    })
    addVideoStream(myVideo, myDisplayStream)
}


const addVideoStream = (video, stream) => {
    console.log("addvideo stream func")
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    })
    videoGrid.append(video)
}

// peer "open" happens when establishing a connection to my peerJS server is complete.
peer.on("open", id => {
    console.log("My user ID is:", id)
    socket.emit("join-room", roomID, id)
})




document.getElementById("camera").addEventListener("click", startCamera)
document.getElementById("screen").addEventListener("click", startScreenShare)

