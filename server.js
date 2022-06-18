console.log("Server starting...");

const { v4: uuidV4 } = require("uuid");
const http = require("http");

const express = require("express");
const path = require("path");

const port = 3000;

const app = express();

const server = http.createServer(app);

const io = require("socket.io")(server);

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/", (req, res) => {
	res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
	res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
	// console.log("someone just connected");

	socket.on("join-room", (roomId, userId) => {
		// console.log(roomId, userId);
		socket.join(roomId);
		socket.on("ready", () => {
			socket.broadcast.to(roomId).emit("user-connected", userId);
		});

		socket.on("disconnect", () => {
			socket.broadcast.to(roomId).emit("user-disconnected", userId);
		});
	});
});

server.listen(port);
