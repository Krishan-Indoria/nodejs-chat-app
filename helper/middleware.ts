import express, {Express} from 'express';
import bodyParser from 'body-parser';
import db from '.././db/db';
import morgan from 'morgan';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { router } from '.././Controllers/route';
import { Server } from 'socket.io';
import { validate_token } from '../Controllers/auth.controller';
import path from 'path';

export default async (app: Express, _io: Server) => {
    await db.connect();

    app.use("/", express.static(__dirname + "/../images"));
    app.use("/", express.static(__dirname + "/../files"));
    app.use("/public", express.static(__dirname + "/../public"));
    app.use(fileUpload())
    app.use(cors())
    app.use(morgan('dev'))
    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }))

    _io.use(async (socket, next) => {
        try {
            var token = socket.handshake.auth?.token;
            let payload = await validate_token(token);
            next();
        }
        catch {
            next(new Error('Not Authorize'));
        }
    })

    // parse application/json
    app.use(bodyParser.json())
    app.use('/api', router)

    app.set('view engine', 'ejs');
    
}


