var peers = {};
function handleLoad() {
    var socket = io();

    console.log('socket', socket)

    const videoGrid = document.getElementById('video-grid');
    const myVideo = document.createElement('video');
    myVideo.muted = true;
    var peer = new Peer(undefined, {
    // path: '/peerjs',
    host: '/',
    port: '9000',
    });
    let myVideoStream;
    window.navigator.mediaDevices
    .getUserMedia({
    audio: true,
    video: true,
    })
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream);
        peer.on('call', (call) => {
            call.answer(stream);
            const video = document.createElement('video');
            call.on('stream', (userVideoStream) => {
            console.log('Receiver:Caller User Stream');
            addVideoStream(video, userVideoStream);
            });
        });
        socket.on('user-connected', (userId) => {
            console.log('user-connected', userId)
            connectToNewUser(userId, stream);
        });
    });
    const connectToNewUser = (userId, stream) => {
        const call = peer.call(userId, stream);
        const video = document.createElement('video');
        call.on('stream', (userVideoStream) => {
            console.log('Caller:Receiver User Stream');
            addVideoStream(video, userVideoStream);
        });
        call.on('close', () => {
            video.remove();
        });

        peers[userId] = call;
    };

    socket.on('user-disconnect', userId => {
        console.log('user-disconnect', userId);
        peers[userId].close();
    })

    peer.on('open', (id) => {
        console.log('peer open', id)
        socket.emit('join-room', ROOM_ID, id);
    });
    const addVideoStream = (video, stream) => {
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play();
            videoGrid.append(video);
        });
    };
}
