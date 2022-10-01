import ChatModel, { IChatModel } from "../models/chat.model";
import UserModel from "../models/user.model";


export const fetch_user_chat = async (user1: any, user2: any): Promise<IChatModel[]> => {
    var chat = await ChatModel.find({ $or: [{userId_1: user1, userId_2: user2}, {userId_1: user2, userId_2: user1}] }).sort({ "createdAt" : 1 }).lean();
    return chat;
}

export const send_message = async (userId_1: any, userId_2: any, message: string, msg_type: string) => {
    var user = await UserModel.findOne({ _id: userId_1 }).lean();
    var image = user?.image;

    var chat = new ChatModel({
        userId_1,
        userId_2,
        message,
        message_type: msg_type,
        image: image
    })

    await chat.save();
}