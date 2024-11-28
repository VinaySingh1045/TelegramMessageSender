import { Router } from "express";
import { sendTask, submitCode, userLogin } from "../controllers/User.controller.js";
import { verfiyJWT } from "../middlewares/auth.middleware.js";

export const router = Router()

// Define your routes here
router.route("/login").post(userLogin)
router.route("/submitCode").post(submitCode)
router.route("/sendTask").post(verfiyJWT, sendTask)