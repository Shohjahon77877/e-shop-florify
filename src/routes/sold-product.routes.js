import { Router } from 'express';
import { SoldProductController } from '../controllers/sold-product.controller.js';

const router = Router();
const controller = new SoldProductController();

router
    .post('/', controller.createSoldProduct)
    .get('/', controller.getSoldProducts)
    .get('/:id', controller.getSoldProductById)
    .patch('/:id', controller.updateSoldProduct)
    .delete('/:id', controller.deleteSoldProduct)
export default router;