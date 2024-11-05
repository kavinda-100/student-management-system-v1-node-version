import express from "express";
import {signUp, signIn, signOut, resetPassword, askResetPassword, askEmailVerification, verifyEmail, askEmailReset, resetEmail} from "./auth.controller";
import { zodMiddleware } from "../../middleware/zodMiddleware";
import {zodUserSchema, zodUserSignInSchema} from "../../shared/zod/user/user.zod"
import {roleMiddleware} from "../../middleware/roleMiddleware";
import {authMiddleware} from "../../middleware/authMiddleware";
import {zodResetPasswordSchema, zodResetEmailSchema} from "../../shared/zod/validation.zod";

const router = express.Router();

// ////////////////////
// this route is for admin only and only used for testing and development
// edufusion.com/api/v1/auth/admin/sign-up
router.post("/admin/sign-up", zodMiddleware(zodUserSchema), signUp);
// //////////////////////

//edufusion.com/api/v1/auth/sign-up
router.post("/sign-up", authMiddleware, roleMiddleware(["admin"]), zodMiddleware(zodUserSchema), signUp);
//edufusion.com/api/v1/auth/sign-in
router.post("/sign-in", zodMiddleware(zodUserSignInSchema), signIn);
//edufusion.com/api/v1/auth/sign-out
router.post("/sign-out", signOut);
//edufusion.com/api/v1/auth/ask-reset-password
router.get("/ask-reset-password",  authMiddleware, roleMiddleware(["admin", "student", "teacher"]), askResetPassword);
//edufusion.com/api/v1/auth/reset-password
router.patch("/reset-password", authMiddleware, roleMiddleware(["admin", "student", "teacher"]), zodMiddleware(zodResetPasswordSchema), resetPassword);
//edufusion.com/api/v1/auth/ask-email-verification
router.get("/ask-email-verification", authMiddleware, roleMiddleware(["admin", "student", "teacher"]), askEmailVerification);
//edufusion.com/api/v1/auth/verify-email/:token
router.patch("/verify-email/:token", authMiddleware, roleMiddleware(["admin", "student", "teacher"]), verifyEmail);
//edufusion.com/api/v1/auth/ask-email-reset
router.get("/ask-email-reset", authMiddleware, roleMiddleware(["admin", "student", "teacher"]), askEmailReset);
//edufusion.com/api/v1/auth/reset-email/:token
router.patch("/reset-email/:token", authMiddleware, roleMiddleware(["admin", "student", "teacher"]), zodMiddleware(zodResetEmailSchema), resetEmail);



export default router;