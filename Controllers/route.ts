import {register, login, ImageUpload, FileUpload} from './login.controller';
import { Router } from 'express'
import { getChat, send_message } from './chat.controller';


const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/image-upload', ImageUpload);
router.post('/file-upload', FileUpload);


router.get('/get-chat/:userId', getChat);
router.post('/send-message', send_message);

export {
    router
};