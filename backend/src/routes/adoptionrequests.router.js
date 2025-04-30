import { Router } from "express";
import { createAdoptionRequest, getAllAdoptionRequests,getAdoptionRequestById,updateAdoptionRequestStatus, deleteAdoptionRequest,getOutgoingAdoptionRequests,getIncomingAdoptionRequests} from "../controllers/adoptionrequests.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();

router.post("/create-adoption-request", createAdoptionRequest);
router.get("/get-all-adoption-requests", getAllAdoptionRequests);
router.get("/get-adoption-request-by-id/:id", getAdoptionRequestById);
router.put("/update-adoption-request-status/:id", verifyJWT, updateAdoptionRequestStatus);
router.delete("/delete-adoption-request/:id", verifyJWT, deleteAdoptionRequest);
router.get("/outgoing-requests", verifyJWT, getOutgoingAdoptionRequests);
router.get("/incoming-requests", verifyJWT, getIncomingAdoptionRequests);

export default router;


