import { Router } from "express";
import { createAdoptionRequest, getAllAdoptionRequests, getAdoptionRequestById, updateAdoptionRequestStatus, deleteAdoptionRequest, getUserAdoptionRequests, getPetAdoptionRequests } from "../controllers/adoptionrequests.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/create-adoption-request",  createAdoptionRequest);
router.get("/get-all-adoption-requests", getAllAdoptionRequests);
router.get("/get-adoption-request-by-id/:id", getAdoptionRequestById);
router.put("/update-adoption-request-status/:id", verifyJWT, updateAdoptionRequestStatus);
router.delete("/delete-adoption-request/:id", verifyJWT, deleteAdoptionRequest);    
router.get("/get-user-adoption-requests/:id",verifyJWT,getUserAdoptionRequests);
router.get("/get-pet-adoption-requests",getPetAdoptionRequests);

export default router;


