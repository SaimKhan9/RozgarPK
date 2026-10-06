import { Router } from 'express';
import {
  getAdminStats,
  getAdminUsers,
  updateUserStatus,
  deleteAdminUser,
  getAdminWorkers,
  toggleWorkerVerification,
  getAdminJobs,
  updateJobStatusAdmin,
  deleteJobAdmin,
  getAdminAnalytics,
  claimAdminRole,
} from '../controllers/adminController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// Endpoint for claiming admin role with secret key
router.post('/claim', protect, claimAdminRole);

// All subsequent routes require user to be logged in with admin role
router.use(protect, restrictTo('admin'));

router.get('/stats', getAdminStats);
router.get('/analytics', getAdminAnalytics);

router.get('/users', getAdminUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteAdminUser);

router.get('/workers', getAdminWorkers);
router.patch('/workers/:id/verify', toggleWorkerVerification);

router.get('/jobs', getAdminJobs);
router.patch('/jobs/:id/status', updateJobStatusAdmin);
router.delete('/jobs/:id', deleteJobAdmin);

export default router;
