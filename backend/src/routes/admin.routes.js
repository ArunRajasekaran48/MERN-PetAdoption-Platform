import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import {
    getDashboardStats,
    getAllUsers,
    getAllPetListings,
    removePetListing,
    getAllReviews,
    deleteReview,
    suspendUser,
    banUser,
    unbanUser,
} from "../controllers/admin.controller.js";

const router = Router();

// Apply verifyJWT and verifyAdmin middleware to all routes
router.use(verifyJWT, verifyAdmin);

// Dashboard Stats
router.get("/dashboard",verifyJWT, verifyAdmin,getDashboardStats);

// User Management
router.get("/users", getAllUsers);
router.post("/users/:userId/suspend", suspendUser);
router.post("/users/:userId/ban", banUser);
router.post("/users/:userId/unban", unbanUser);

// Pet Listing Management
router.get("/pets", getAllPetListings);
router.delete("/pets/:petId", removePetListing);

// Review Moderation
router.get("/reviews", getAllReviews);
router.delete("/reviews/:reviewId", deleteReview);



export default router; 