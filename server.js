const express = require("express");
const app = express();
const server = require("http").createServer(app)
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const io = require("socket.io")(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
})

const sendMail = require("./sendgrid");
const { resolveNaptr } = require("dns");


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

app.post("/inviteuser", (req, res) => {

    let email = req.body.email;
    let url = req.body.url;

    console.log(req.body)

    let sendMailRequest = sendMail(email, url)
    sendMailRequest.then(() => {
        res.status(200).send("Mail sent");
        console.log("mail sent")
    }).catch(err => {
        console.log(err);
        res.status(500).send("Mail Not Sent. Check server logs")
    })

})


io.on("connection", (socket) => {
    console.log("new user joined")
    socket.on("join-room", (roomID, userID) => {
        socket.join(roomID);
        console.log(`A user joind the room ${roomID}`)
        socket.broadcast.to(roomID).emit("user-connected", userID)
    })


    socket.on("sent-message", (roomID, message) => {
        socket.broadcast.to(roomID).emit("received-message", message)
    })

})

server.listen(3030, () => {
    console.log("server started")
})

