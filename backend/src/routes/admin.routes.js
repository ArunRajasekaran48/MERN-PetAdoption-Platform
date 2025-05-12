import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import {
    getDashboardStats,
    getAllUsers,
    toggleUserBlock,
    getAllPetListings,
    removePetListing,
    getAllReviews,
    deleteReview,
    getAllReports,
    updateReportStatus} from "../controllers/admin.controller.js";

const router = Router();

// Apply verifyJWT and verifyAdmin middleware to all routes
router.use(verifyJWT, verifyAdmin);

// Dashboard Stats
router.get("/dashboard",verifyJWT, verifyAdmin,getDashboardStats);

// User Management
router.get("/users", getAllUsers);
router.put("/users/:userId/block", toggleUserBlock);

// Pet Listing Management
router.get("/pets", getAllPetListings);
router.delete("/pets/:petId", removePetListing);

// Review Moderation
router.get("/reviews", getAllReviews);
router.delete("/reviews/:reviewId", deleteReview);

// Report Management
router.get("/reports", getAllReports);
router.patch("/reports/:reportId/status", updateReportStatus);

export default router; 