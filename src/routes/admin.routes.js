import { Router } from "express";
import { AdminController, AdminAuthController } from "../controllers/admin.controller.js";
import { AuthGuard } from '../guards/auth.guard.js';
import { RolesGuard } from '../guards/role.guard.js';
import { SelfGuard } from'../guards/self.guard.js'

const router = Router();
const controller = new AdminController();
const authController = new AdminAuthController();

router
    .post('/signin', authController.adminSignIn)
    .post('/confirmsignin', authController.confirmAdminSignIn)
    .post('/token', authController.newAccessToken)
    .post('/logout', authController.logout)
    .post('/', AuthGuard, RolesGuard(['superadmin']), controller.createAdmin)
    .get('/', AuthGuard, RolesGuard(['superadmin']), controller.getAllAdmins)
    .get('/:id', AuthGuard, RolesGuard(['superadmin']), controller.getAdminById)
    .patch('/:id', AuthGuard, SelfGuard, controller.updateAdmin)
    .delete('/:id', AuthGuard, SelfGuard, controller.deleteAdmin)
export default router