import { Router } from "express";
import { reportUser,reportReview } from "../controllers/report.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router=Router();
router.post("/report-user",verifyJWT,reportUser)
router.post("/report-review",verifyJWT,reportReview)
export default router;