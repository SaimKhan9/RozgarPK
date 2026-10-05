import { Router } from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
} from '../controllers/jobController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.get('/',         getJobs);
router.get('/my',       protect, restrictTo('client'), getMyJobs);
router.get('/:id',      getJobById);
router.post('/',        protect, restrictTo('client'), createJob);
router.patch('/:id',    protect, restrictTo('client'), updateJob);
router.delete('/:id',   protect, restrictTo('client'), deleteJob);

export default router;
