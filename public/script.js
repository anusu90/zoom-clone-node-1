const videoGrid = document.getElementById("video-grid")
const myVideo = document.createElement("video")
myVideo.setAttribute("id", "myvideo")
myVideo.muted = true;
const chatHeader = document.querySelector(".chat_header")

const whichStream = {
    camera: true
}
const clicked = {
    isClicked: false
}


var socket = io("/"); // connection to socket IO server has been made here.

console.log("socket is ", socket)
let myVideoStream, myDisplayStream;

// const peer = new Peer(undefined, {
//     path: "/peerjs",
//     host: "/",
//     port: "443"
// });
const peer = new Peer(undefined, { 'iceServers': [{ 'urls': ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }] });

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
async function getScreen() {
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



document.querySelector(".fa-desktop").addEventListener("click", () => {
    changeStream();
})


const changeStream = async () => {

    if (clicked.isClicked) {


    } else {
        myDisplayStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: 'always' | 'motion' | 'never',
                displaySurface: 'application' | 'browser' | 'monitor' | 'window'
            }
        })
        myDisplayStream.getVideoTracks().forEach(track => myVideoStream.addTrack(track))
        console.log(myVideoStream.getVideoTracks())
    }





    // if (whichStream.camera) {
    //     let myDisplayStream = await navigator.mediaDevices.getDisplayMedia({
    //         video: {
    //             cursor: 'always' | 'motion' | 'never',
    //             displaySurface: 'application' | 'browser' | 'monitor' | 'window'
    //         }
    //     })
    //     addVideoStream(myVideo, myDisplayStream)
    //     whichStream.camera = false


    // } else {
    //     let myVideStream2 = await navigator.mediaDevices.getUserMedia(
    //         {
    //             video: true,
    //             audio: true
    //         }
    //     )
    //     addVideoStream(myVideo, myVideStream2)
    //     whichStream.camera = true


}

const sendMessage = () => {
    let messageElement = document.createElement("p")
    let message = document.querySelector("#sendMessageInput").value
    if (message) {
        messageElement.classList.add("sentMessage")
        messageElement.innerHTML = `<div style="display: inline-block; background-color: cornflowerblue; padding: 10px; min-width: 50px;border-radius: 10px; text-align: center;">${message}</div>`;
        socket.emit("sent-message", roomID, message)
        chatHeader.append(messageElement)
        document.querySelector("#sendMessageInput").value = ""
        chatHeader.scrollTop = chatHeader.scrollHeight;
    }
}

const receiveMessage = (message) => {
    let messageElement = document.createElement("p")
    messageElement.classList.add("recieveMessage")
    messageElement.innerHTML = `<div style="display: inline-block; background-color: greenyellow; padding: 10px; min-width: 50px;border-radius: 10px; text-align: center;">${message}</div>`;;
    chatHeader.append(messageElement)
    chatHeader.scrollTop = chatHeader.scrollHeight;
}

document.querySelector("#sendMessageInput").addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
        sendMessage()
    }
})


document.querySelector("#sendBtn").addEventListener("click", (e) => {
    sendMessage();
})

socket.on("received-message", (message) => {
    receiveMessage(message)
})

document.querySelector("#inviteBtn").addEventListener("click", async (e) => {
    let email = document.querySelector("#inviteInput").value;
    if (email) {
        let url = window.location.href;
        let inviteData = {
            email: email,
            url: url
        }
        let mailSendReq = await fetch("https://node-zoom-clone-1.herokuapp.com/inviteuser", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(inviteData)
        })

        mailSendReq.status === 200 ? document.querySelector("#inviteInput").value = "" : null;
    }
})


const toggleMute = (e) => {

    console.log(myVideoStream.getTracks());

    const sound = myVideoStream.getAudioTracks()[0].enabled;
    if (sound) {
        const sound = myVideoStream.getAudioTracks()[0].enabled = false;
        e.target.style = "color:red;"
    } else {
        const sound = myVideoStream.getAudioTracks()[0].enabled = true;
        e.target.style = "color:whitesmoke;"
    }
}

const toggleVideo = (e) => {
    const video = myVideoStream.getVideoTracks()[0].enabled;
    if (video) {
        const video = myVideoStream.getVideoTracks()[0].enabled = false;
        e.target.style = "color:red;"
    } else {
        const video = myVideoStream.getVideoTracks()[0].enabled = true;
        e.target.style = "color:whitesmoke;"
    }
}


document.querySelector(".fa-volume-mute").addEventListener("click", (e) => toggleMute(e))
document.querySelector(".fa-video-slash").addEventListener("click", (e) => toggleVideo(e))