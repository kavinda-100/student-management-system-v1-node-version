import express from "express";
import {roleMiddleware} from "../../middleware/roleMiddleware";
import {authMiddleware} from "../../middleware/authMiddleware";
import {getUserProfile} from "./user.controller";

const router = express.Router();

// edufusion.com/api/v1/user/:id
router.get("/profile/:id", authMiddleware, roleMiddleware(["admin", "student", "teacher"]), getUserProfile);

export default router;