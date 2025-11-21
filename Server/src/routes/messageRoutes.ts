import express from 'express';
import { upload } from '../config/multer.js';
import { protect } from '../middlewares/auth.js';
import { getChatMessages, sendMessage, sseContoller } from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.post('/send', upload.single('image'), protect, sendMessage);
messageRouter.get('/:userId', protect,  sseContoller);
messageRouter.post('/get', protect, getChatMessages)

export default messageRouter;