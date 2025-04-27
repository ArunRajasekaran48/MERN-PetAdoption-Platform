import { Router } from "express";
import { createPet, getAllPets, getPetById, deletePet, updatePet, updateAdoptionStatus, getPetsByOwner, updatePetImages } from "../controllers/pets.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router= Router()

router.post("/create-pet", upload.array("images", 4), createPet);
router.get("/getAllPets",getAllPets);
router.get("/getPetById/:id",getPetById);
router.put("/updatePet/:id",verifyJWT,updatePet);
router.delete("/deletePet/:id",verifyJWT,deletePet);
router.put("/updateAdoptionStatus/:id",verifyJWT,updateAdoptionStatus);
router.get("/getPetsByOwner/:ownerId",getPetsByOwner);
router.put("/updatePetImages/:id",verifyJWT,upload.array("images", 4),updatePetImages);
export default router