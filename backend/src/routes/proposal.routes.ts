import { Router } from 'express';
import { ProposalController } from '../controllers/proposal.controller';

const router = Router();

router.post('/inbound', ProposalController.receiveInbound);
router.get('/rfp/:rfpId', ProposalController.getByRFP);
router.get('/:id', ProposalController.getOne);
router.post('/:id/reparse', ProposalController.reparse);
router.put('/:id/status', ProposalController.updateStatus);
router.delete('/:id', ProposalController.delete);

export default router;
