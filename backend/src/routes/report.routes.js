import { Router } from "express";
import { reportUser,reportReview, getAllReports, updateReportStatus } from "../controllers/report.controller";
import { verifyJWT } from "../middleware/auth.middleware";

const router=Router();
router.post("/report-user",verifyJWT,reportUser)
router.post("/report-review",verifyJWT,reportReview)
router.get("/get-all-reports",getAllReports)
router.put("/updateReportStatus",updateReportStatus)

export default router;