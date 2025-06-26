import { Router } from "express";
import { ClientController } from "../controllers/client.controller.js";

const router = Router();
const controller = new ClientController();

router
    .post('/signup', controller.clientSignUp)
    .post('/signin', controller.clientSignIn)
    .post('/confirmsignin', controller.confirmClientSignIn)
    .post('/token', controller.newAccessToken)
    .post('/logout', controller.logout)
export default router;