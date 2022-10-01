import { NextFunction, Request, Response } from "express";
import { Schema } from "mongoose";
import User, { IUserModel } from "../models/user.model"
import jwt from 'jsonwebtoken';
import path from "path";

type _cb = (err: string, user?: IUserModel | null) => void;

export const isAuthenticate = (_id: Schema.Types.ObjectId, cb: _cb) => {
    User.findOne({ _id }).then(user => {
        user?.name
    }, res => {
        
    })
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { username, password } = req.body;

        var user = await User.findOne({ username }).lean();
        if(!user) {
            throw new Error('User Not Found');
        }

        if(user.password != password) {
            throw new Error('Incorrect Credential');
        }

        var secret: string = process.env.JWT_SECRET || '';
        var token = jwt.sign({ userId: user._id }, secret, { expiresIn: 60*60*60 });

        res.status(200).json({
            status: true,
            token
        })

    }
    catch(err: any) {
        // next(err);
        res.status(500).json({
            status: false,
            message: err.message
        })
    }
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, username, password } = req.body;

        if(!name || !username || !password) {
            throw new Error('All field required');
        }

        // console.log('req.files', req.files)

        const files = req.files;
        if(!files || !files.image) {
            throw new Error('please select image')
        }
        
        var f: any = files.image;
        var imgtype = f.mimetype.split('/');
        if(imgtype[0] != 'image') {
            throw new Error('Only Image Allowed');
        }
        var filetype = imgtype[1];
        var filename = 'profile_' + new Date().getTime() + '.' + filetype;

        var dest_path = path.join(__dirname, '..', 'images', filename);
        f.mv(dest_path, (err: any) => {
            if(err) next(err);
        })
        var image = filename;

        var isUser = await User.findOne({ username }).lean();
        if(isUser) {
            throw new Error('User already exist');
        }

        var user = new User({
            name,
            username,
            password,
            image,
            code: ''
        });

        await user.save();

        // socket_io.on('user:register', async (user_id) => {
        //     console.log('user:register', user_id)
        //     var user = await user_by_id(user_id);
        //     socket_io.emit('new:user', user);
        // })

        res.status(200).json({
            status: true,
            message: 'User Registered Successfully',
            userId: user._id
        })

    }
    catch(err: any) {
        // next(err);
        res.status(500).json({
            status: false,
            message: err.message
        })
    }
}

export const ImageUpload = async (req: Request, res: Response) => {
    try {
        const files = req.files;
        if(!files || !files.image) {
            throw new Error('please select image')
        }
        
        var f: any = files.image;
        var imgtype = f.mimetype.split('/');
        if(imgtype[0] != 'image') {
            throw new Error('Only Image Allowed');
        }
        var filetype = imgtype[1];
        var filename = 'chat_' + new Date().getTime() + '.' + filetype;

        var dest_path = path.join(__dirname, '..', 'images', filename);
        f.mv(dest_path, (err: any) => {
            if(err) {
                res.json({
                    status: false,
                    message: err?.message || err
                });
            }
            else {
                res.json({
                    status: true,
                    image: filename
                });
            }
        })
    }
    catch (err: any) {
        res.json({
            status: false,
            message: err.message
        });
    }
}

// export function getUserChat()