import { Router } from "express";
import { SalesmanController, SalesmanAuthController } from "../controllers/salesman.controller.js";

const router = Router();
const controller = new SalesmanController();
const authController = new SalesmanAuthController();

router
    .post('/signin', authController.salesmanSignIn)
    .post('/confirmsignin', authController.confirmSalesmanSignIn)
    .post('/token', authController.newAccessToken)
    .post('/logout', authController.logout)
    .post('/', controller.createSalesman)
    .get('/', controller.getSalesmans)
    .get('/:id', controller.getSalesmanById)
    .patch('/:id', controller.updateSalesman)
    .delete('/:id', controller.deleteSalesman)
export default router