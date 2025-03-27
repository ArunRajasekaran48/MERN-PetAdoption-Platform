import { Router } from "express";
import { createPet } from "../controllers/pets.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const router= Router()

router.post("/create-pet", upload.array("images", 4), createPet);

export default router