import { Router } from 'express';
import {
  createProposal,
  getProposalsByJob,
  getMyProposals,
  updateProposalStatus,
} from '../controllers/proposalController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.post('/',              protect, restrictTo('worker'), createProposal);
router.get('/my',             protect, restrictTo('worker'), getMyProposals);
router.get('/job/:jobId',     protect, restrictTo('client'), getProposalsByJob);
router.patch('/:id',          protect, restrictTo('client'), updateProposalStatus);

export default router;
