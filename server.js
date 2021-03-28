const express = require("express");
const app = express();
const server = require("http").createServer(app)

app.set('view engine', 'ejs')


app.get("/", (req, res) => {
    res.render("room")
})

server.listen(3030, () => {
    console.log("server started")
})

