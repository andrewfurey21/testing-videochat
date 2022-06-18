const socket = io("/");

const videoGrid = document.getElementById("grid");
console.log(videoGrid);

//Figure out how to get your own peer server working, should be grand though
const myPeer = new Peer(undefined, {
	host: "/",
	port: "3001",
});

// const myPeer = new Peer()

const myVideo = document.createElement("video");
myVideo.id = "video"
videoGrid.appendChild(myVideo)
const peers = {}
myVideo.muted = false;

navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true,
	})
	.then((stream) => {
        addVideoStream(myVideo, stream);

        myPeer.on('call', call => {
            call.answer(stream);
            const v = document.createElement("video");

            call.on('stream', userVideoStream => {
                addVideoStream(v, userVideoStream)
            })
        })
        socket.emit('ready')

        socket.on('user-connected', userId => {
            connectToNewUser(userId, stream)
            console.log("user connected")
        })

        socket.on('user-disconnected', userId => {
            if (peers[userId]) peers[userId].close();
        })

	});

myPeer.on("open", (id) => {
	socket.emit("join-room", ROOM_ID, id);
});

function addVideoStream(video, stream) {
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
        video.play();
	});
    video.muted = false;
    video.id = "video";

	videoGrid.appendChild(video);
}

function connectToNewUser(userId, stream) {
    console.log("connecting new user: " + userId)
    const call = myPeer.call(userId, stream);
    const anotherVideo = document.createElement("video");
    call.on('stream', userVideoStream => {
        addVideoStream(anotherVideo, userVideoStream)
    })
    call.on('close', () => {
        anotherVideo.remove();
    })

    peers[userId] = call
}
