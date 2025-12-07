import { Router } from 'express';
import { RFPController } from '../controllers/rfp.controller';

const router = Router();

router.post('/', RFPController.create);
router.get('/', RFPController.getAll);
router.get('/:id', RFPController.getOne);
router.put('/:id', RFPController.update);
router.delete('/:id', RFPController.delete);
router.post('/:id/send', RFPController.send);
router.post('/:id/compare', RFPController.compare);

export default router;
