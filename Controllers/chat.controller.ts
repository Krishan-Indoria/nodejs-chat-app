import { Response } from "express";
import { IRequest } from "../interfaces/request.interface";
import Chat from "../models/chat.model";
import User from "../models/user.model";
import { fetch_user_chat } from "./chat.service";


export const getChat = async (req: IRequest | any, res: Response) => {
    const { userId } = req.params;

    let chat = await fetch_user_chat(req.userId, userId);
    res.status(200).json({
        status: true,
        data: chat
    })
}

export const send_message = async (req: IRequest | any, res: Response) => {
    const { userId, message } = req.body;

    var isUser = await User.exists({ _id: userId });
    if(!isUser) {
        return res.status(400).json({
            status: false,
            message: 'sender not found'
        })
    }
    var user = await User.findOne({ _id: req.userId }).lean();
    var chat = new Chat({
        userId_1: req.userId,
        userId_2: userId,
        image: user?.image,
        message
    })

    await chat.save();
    res.status(200).json({
        status: true,
        message: 'message send'
    })
}
