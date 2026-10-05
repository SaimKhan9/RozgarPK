import { Router } from 'express';
import {
  getWorkers,
  getWorkerById,
  createWorkerProfile,
  toggleAvailability,
} from '../controllers/workerController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.get('/',               getWorkers);
router.get('/:id',            getWorkerById);
router.post('/profile',       protect, restrictTo('worker'), createWorkerProfile);
router.patch('/availability', protect, restrictTo('worker'), toggleAvailability);

export default router;
