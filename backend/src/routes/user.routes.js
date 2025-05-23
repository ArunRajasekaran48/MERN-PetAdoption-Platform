import { Router } from "express";
import { changeCurrentPassword, ChangedAccountDeatils, loginUser, logoutUser, refreshAccessToken, registerUser, requestPasswordReset, resetPassword, verifyResetToken } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/changepassword").post(verifyJWT,changeCurrentPassword)
router.route("/change-account-details").put(verifyJWT,ChangedAccountDeatils)
router.route("/request-reset-password").post(requestPasswordReset)
router.get("/reset-password/:token", verifyResetToken)
router.post("/reset-password", resetPassword)
export default router