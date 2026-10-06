import { Router } from 'express';
import {
  createChatRoom,
  getChatRooms,
  getMessages,
  sendMessage,
  deleteChatRoom,
  unsendMessage,
} from '../controllers/chatController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/rooms',                protect, getChatRooms);
router.post('/rooms',               protect, createChatRoom);
router.delete('/rooms/:roomId',     protect, deleteChatRoom);
router.get('/messages/:roomId',     protect, getMessages);
router.post('/messages',            protect, sendMessage);
router.delete('/messages/:messageId', protect, unsendMessage);

export default router;
