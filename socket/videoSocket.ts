import { Server } from "socket.io"

export default (io: Server) => {
io.on("connection", async function(socket) {
    console.log('socket init', socket.id);
    
    socket.on('join-room', (roomId: string, peerId: string) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', peerId);

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', peerId);
        })
    })

});
}