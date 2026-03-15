import express from "express";
import {
  forgotPasswordController,
  getUserProfileController,
  loginController,
  logoutController,
  registerController,
  updatePasswordController,
  updateProfileController,
  updateProfilePicController,
} from "../controllers/userController.js";
import { isAuth } from "../middlarware/authMiddleware.js";
import { singleupload } from "../middlarware/multer.js";
import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  // windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
});

const router = express();
// resiter rout
router.post("/register", limiter, registerController);
//login route
router.post("/login", limiter, loginController);

// profile route

router.get("/profile", isAuth, getUserProfileController);

// logout rout
router.get("/logout", isAuth, logoutController);

// update profile route
router.put("/update-profile", isAuth, updateProfileController);
//update password route
router.put("/update-password", isAuth, updatePasswordController);

// update profile pic
router.put("/update-picture", isAuth, singleupload, updateProfilePicController);
// forgot password route
router.post("/forgot-password", forgotPasswordController);

export default router;
