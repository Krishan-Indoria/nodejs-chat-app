import ChatModel from "../models/chat.model";
import UserModel, { IUserModel } from "../models/user.model";


export const fetch_user_list = async (userId: any): Promise<IUserModel[]> => {

    var list = await ChatModel.aggregate([
        {
            $match: {
                userId_1: userId
            }
        },
        { $group: {_id: null, userId2: {$addToSet: "$userId_2"}} },
        {
            $unwind: "$userId2"
        },
        { $project: { _id: 0 }}
    ])

    console.log('list', list)
    var users = await UserModel.find({ _id: { $ne: userId } }).lean();
    return users;
}


export const user_by_id = async (userId: any) => {
    var user = await UserModel.findOne({ _id: userId }).lean();
    return user;
}