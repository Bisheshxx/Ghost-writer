import { Router } from "express";
import {
  deleteExperienceController,
  getExperienceController,
  insertExperienceController,
  updateExperienceController,
} from "../controllers/experience/experience.controller";
import { isAuthenticated } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  addExperienceSchema,
  patchExperienceSchema,
} from "../validation/experience";
import { asyncHandler } from "../utils/express-async-errors";

const router = Router();
router.post(
  "/experience",
  isAuthenticated,
  validateBody(addExperienceSchema),
  asyncHandler(insertExperienceController),
);
router.get("/experience", isAuthenticated, getExperienceController);
router.patch(
  "/experience/:experienceId",
  isAuthenticated,
  validateBody(patchExperienceSchema),
  asyncHandler(updateExperienceController),
);
router.delete(
  "/experience/:experienceId",
  isAuthenticated,
  asyncHandler(deleteExperienceController),
);

export default router;
