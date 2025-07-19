import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { createReport, getAllReports, updateReportStatus } from "../controllers/report.controller.js";

const router = Router();

// User: create a report
router.post("/reports", verifyJWT, createReport);

// Admin: get all reports
router.get("/admin/reports", verifyJWT, verifyAdmin, getAllReports);

// Admin: update report status
router.put("/admin/reports/:id", verifyJWT, verifyAdmin, updateReportStatus);

export default router; 