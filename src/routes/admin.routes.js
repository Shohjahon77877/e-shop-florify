import { Router } from "express";
import { AdminController, AdminAuthController } from "../controllers/admin.controller.js";

const router = Router();
const controller = new AdminController();
const authController = new AdminAuthController();

router
    .post('/signin', authController.adminSignIn)
    .post('/confirmsignin', authController.confirmAdminSignIn)
    .post('/token', authController.newAccessToken)
    .post('/logout', authController.logout)
    .post('/', controller.createAdmin)
    .get('/', controller.getAllAdmins)
    .get('/:id', controller.getAdminById)
    .patch('/:id', controller.updateAdmin)
    .delete('/:id', controller.deleteAdmin)
export default router