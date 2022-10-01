import * as mongoose from 'mongoose';

export interface IUserModel {
    _id?: mongoose.Schema.Types.ObjectId,
    name: string,
    username: string,
    password: string,
    code: string,
    image: string
}

var UserSchema = new mongoose.Schema<IUserModel>({
    name: String,
    username: String,
    password: String,
    code: String,
    image: String
}, { timestamps: true })

var UserModel = mongoose.model('user', UserSchema);

UserModel.watch().on('change', data => {
    console.log('UserModel', data.operationType);
})


export default UserModel;