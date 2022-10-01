import { Server } from "socket.io";
import { validate_token } from "../Controllers/auth.controller";
import { fetch_user_chat, send_message } from "../Controllers/chat.service";
import { fetch_user_list } from "../Controllers/user.service";
import UserModel from "../models/user.model";
import UserSocketModel from "../models/user_socket.model";

export default (io: Server) => {
  io.on("connection", async function(socket) {
    
    var token = socket.handshake.auth?.token;
    let payload = await validate_token(token);
    
    console.log('Socket Init', socket.id);
    socket.on('message', data => console.log(data));
    var user = await UserModel.findOne({ _id: payload.userId }).lean();
    
    io.to(socket.id).emit('user:profile', user);

    var user_socket = await UserSocketModel.findOne({ userId: payload.userId });
    if(user_socket) {
      var old_socket = user_socket.socketId;
      io.to(old_socket).emit('another:connect', old_socket);

      user_socket.socketId = socket.id;
    }
    else {
      user_socket = new UserSocketModel({
        userId: payload.userId,
        socketId: socket.id
      })
    }
    await user_socket.save();

    socket.broadcast.emit('user-connected', user_socket.userId);

    // socket.on('user:register', async (userId) => {
    //   console.log('user:register', userId)
    //   var user = await user_by_id(userId);
    //   socket.broadcast.emit('new:user', user);
    // });


    var client = await io.sockets.allSockets();
    // client.delete(socket.id)
    var user_socket_list = await UserSocketModel.find({ socketId: {$in: Array.from(client)} }).lean();
    io.to(socket.id).emit('user:current:online', user_socket_list);

    
    socket.on('user:chat', async (userId, cb) => {
      let chat = await fetch_user_chat(payload.userId, userId);
      cb(chat);
    });

    socket.on('user:list', async (cb) => {
      let users = await fetch_user_list(payload.userId);
      cb(users);
      io.to(socket.id).emit('user:list:resp', users);
    });

    socket.on('chat:send:message', async (msg_obj, cb) => {
      var userId = msg_obj.userId;
      var message = msg_obj.message as string;
      var msg_type = msg_obj.type as string;

      await send_message(payload.userId, userId, message, msg_type);

      var user = await UserModel.findOne({ _id: payload.userId }).lean();
      var user_socket1 = await UserSocketModel.findOne({ userId: userId }).lean();
      cb(user);
      if(user_socket1?.socketId) {
        msg_obj.senderId = payload.userId;
        msg_obj.senderName = user?.name;
        msg_obj.image = user?.image;
        msg_obj.msg_type = "message";
        io.to(user_socket1.socketId).emit('message:received', msg_obj);
      }
    });

    socket.on('chat:send:image', async (msg_obj, cb) => {
      var userId = msg_obj.userId;
      var message = msg_obj.image as string;
      var msg_type = msg_obj.type as string;
      msg_obj.message = message;
      await send_message(payload.userId, userId, message, msg_type);

      var user = await UserModel.findOne({ _id: payload.userId }).lean();
      var user_socket1 = await UserSocketModel.findOne({ userId: userId }).lean();
      cb(user);
      if(user_socket1?.socketId) {
        msg_obj.senderId = payload.userId;
        msg_obj.senderName = user?.name;
        msg_obj.image = user?.image;
        msg_obj.msg_type = "image";
        io.to(user_socket1.socketId).emit('message:received', msg_obj);
      }
    });

    socket.on('disconnect', async function () {
      var user_socket1 = await UserSocketModel.findOne({ socketId: socket.id }).lean();
      if(user_socket1) {
        socket.broadcast.emit('user-disconnected', user_socket1.userId);
      }
    });

    

  });

  io.on('get-message', (msg) => {
    console.log('my message', msg);
  })
}