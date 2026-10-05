import { Router } from 'express';
import { getWorkerReviews, createReview } from '../controllers/reviewController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.get('/worker/:workerId', getWorkerReviews);
router.post('/',                protect, restrictTo('client'), createReview);

export default router;
