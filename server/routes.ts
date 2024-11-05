import express from "express";

import AuthRoute from "./modules/auth/auth.route"
import UserRoute from "./modules/user/user.route"

const router = express.Router();
// Routes
// route for authentication
//edufusion.com/api/v1/auth
router.use("/auth", AuthRoute);
// route for user
//edufusion.com/api/v1/user
router.use("/user", UserRoute);


export default router;