import * as mongoose from 'mongoose';

export interface IUserSocket {
    _id?: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    socketId: string,
}

var UserSocketSchema = new mongoose.Schema<IUserSocket>({
    userId: mongoose.Schema.Types.ObjectId,
    socketId: String
}, { timestamps: true })

var UserSocketModel = mongoose.model('user_socket', UserSocketSchema);

export default UserSocketModel;