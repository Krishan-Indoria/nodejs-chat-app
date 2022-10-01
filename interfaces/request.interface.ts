import {Request} from 'express'
import mongoose from 'mongoose'

export interface IRequest extends Request {
    userId: mongoose.Schema.Types.ObjectId | string
}
