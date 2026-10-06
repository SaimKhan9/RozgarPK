import { Router } from 'express';
import { getNotifications } from '../controllers/notificationController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getNotifications);

export default router;
