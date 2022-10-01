// import { IRequest } from '../interfaces/request.interface';
import jwt from 'jsonwebtoken';
import User, { IUserModel } from '../models/user.model';
import { NextFunction, Response } from 'express';

export const Auth = async (req: any, _: Response, next: NextFunction) => {
    try {
        var bearer: string = req.headers['authorization'] as string;
        if(!bearer) {
            throw new Error('Not Authorize');
        }
        var token = bearer.split(' ')[1];

        let payload = await validate_token(token);

        var user = await User.findOne({ _id: payload.userId }) as IUserModel;
        req.userId = user._id as any;
        next();

    }
    catch(err: any) {
        next(err);
    }
}

export const isAuth = async (req: any, res: Response, next: NextFunction) => {
    try {
        var bearer: string = req.headers['authorization'] as string;
        if(!bearer) {
            throw new Error('Not Authorize');
        }
        var token = bearer.split(' ')[1];

        let payload = await validate_token(token);

        var user = await User.findOne({ _id: payload.userId }) as IUserModel;
        if(!user) throw new Error('Not Authorize');

        res.status(200).json({
            status: true
        })

    }
    catch(err: any) {
        res.status(400).json({
            status: false
        })
    }
}

export async function validate_token(token: string) {
    var secret: string = process.env.JWT_SECRET || '';

    if(!secret) throw new Error('Not Authorize');

    var payload = jwt.verify(token, secret) as any;

    var isUser = await User.exists({ _id: payload.userId });
    if(!isUser) throw new Error('Not Authorize');
    return payload;
}

