import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { createReviewReport, getAllReviewReports, updateReviewReportStatus } from "../controllers/reviewreport.controller.js";

const router = Router();

// User: create a review report
router.post("/review-reports", verifyJWT, createReviewReport);

// Admin: get all review reports
router.get("/admin/review-reports", verifyJWT, verifyAdmin, getAllReviewReports);

// Admin: update review report status
router.put("/admin/review-reports/:id", verifyJWT, verifyAdmin, updateReviewReportStatus);

export default router; 