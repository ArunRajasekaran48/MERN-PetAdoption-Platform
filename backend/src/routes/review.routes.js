import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { addReview, deleteReview, getAverageRating, getReviewsForPet, updateReview } from "../controllers/review.controller.js";
const router = Router()

router.post("/add-review",verifyJWT,addReview)
router.get("/get-Reviews-for-pet/:petId",getReviewsForPet)
router.get("/get-average-ratingOf-pet/:petId",getAverageRating)
router.put("/update-review/:reviewId",verifyJWT,updateReview)
router.delete("/delete-review/:reviewId",verifyJWT,deleteReview)
export default router