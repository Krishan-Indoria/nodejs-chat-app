import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http'
import {Server} from 'socket.io'
import { Auth } from './Controllers/auth.controller';
import middleware from './helper/middleware';
import UserModel from './models/user.model';
import socket from './socket/socket';
// import notifier from 'node-notifier';
import { v4 as uuidv4 } from "uuid";
// import { ExpressPeerServer } from 'peer'
import videoSocket from './socket/videoSocket';

const app = express();
const server = http.createServer(app);
var _io = new Server(server);


// var options: any = {
//     debug: true,
//     allow_discovery: true,
//     port: '3000',
// }
// const peerServer = ExpressPeerServer(server, options);
// app.use('/peerjs', peerServer);

middleware(app, _io);
socket(_io);
// videoSocket(_io);

export const socket_io = _io;

app.get('/test', (_, res) => {
//     notifier.notify('Message');

// // Object
// notifier.notify({
//   title: 'My notification',
//   message: 'Hello, there!'
// });
    res.send('App is running');
})

app.get('/test1', Auth,  (_, res) => {
    res.send('Protected App is running');
})




// app.get('/video/:room',  (req, res) => {
//     res.render('video', { roomId: req.params.room });
// })

// app.get('/', (req, res) => {
//     res.redirect(`/video/${uuidv4()}`);
// });

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.get('/register', function(req, res) {
    res.render('register');
});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`)
})


process.on('uncaughtException', function(err) {
    console.log('uncaughtException', err);
})


// app.get('*', function(req, res) {
//     res.status(400).json({
//         status: false,
//         message: 'err.message'
//     })
// });