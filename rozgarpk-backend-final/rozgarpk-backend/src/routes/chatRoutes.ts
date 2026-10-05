import { Router } from 'express';
import { createChatRoom, getChatRooms, getMessages, sendMessage } from '../controllers/chatController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/rooms',             protect, getChatRooms);
router.post('/rooms',            protect, createChatRoom);
router.get('/messages/:roomId',  protect, getMessages);
router.post('/messages',         protect, sendMessage);

export default router;
