import { Router } from "express";
import {
  getExperienceController,
  insertExperienceController,
} from "../controllers/experience/experience.controller";
import { isAuthenticated } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { addExperienceSchema } from "../validation/experience";

const router = Router();

router.post(
  "/experience",
  isAuthenticated,
  validateBody(addExperienceSchema),
  insertExperienceController,
);

router.get("/experience", isAuthenticated, getExperienceController);

export default router;
