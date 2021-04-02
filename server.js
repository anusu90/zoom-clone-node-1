const express = require("express");
const app = express();
const server = require("http").createServer(app)
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const io = require("socket.io")(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    // path: '/myapp',
    debug: true
})


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")))
app.use("/peerjs", peerServer)


app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`)
})
app.get("/welcome", (req, res) => {
    res.render("welcome")
})


app.get("/:room", (req, res) => {
    res.render("room", { roomID: req.params.room })
})


io.on("connection", (socket) => {
    console.log("new user joined")
    socket.on("join-room", (roomID, userID) => {
        socket.join(roomID);
        console.log(`A user joind the room ${roomID}`)
        socket.broadcast.to(roomID).emit("user-connected", userID)
    })
})

server.listen(3030, () => {
    console.log("server started")
})

