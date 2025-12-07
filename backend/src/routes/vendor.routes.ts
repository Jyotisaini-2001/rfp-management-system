import { Router } from 'express';
import { VendorController } from '../controllers/vendor.controller';

const router = Router();

router.post('/', VendorController.create);
router.get('/', VendorController.getAll);
router.get('/:id', VendorController.getOne);
router.put('/:id', VendorController.update);
router.delete('/:id', VendorController.delete);

export default router;
