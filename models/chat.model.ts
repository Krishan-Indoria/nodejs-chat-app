import * as mongoose from 'mongoose';

type msg_type = 'audio' | 'message' | 'video';

export interface IChatModel {
    _id?: mongoose.Schema.Types.ObjectId,
    userId_1: mongoose.Schema.Types.ObjectId,
    userId_2: mongoose.Schema.Types.ObjectId,
    message: string,
    message_type: msg_type,
    image: string,
    deleted: boolean
}

var ChatSchema = new mongoose.Schema<IChatModel>({
    userId_1: mongoose.Schema.Types.ObjectId,
    userId_2: mongoose.Schema.Types.ObjectId,
    message: String,
    message_type: {
        type: String,
        default: 'message'
    },
    image: String,
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

ChatSchema.index({ createdAt: -1 });

var ChatModel = mongoose.model('chat', ChatSchema);


export default ChatModel;