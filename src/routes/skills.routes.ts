import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  addSkillSchema,
  updateAwardSkillsSchema,
  updatePersonalSkillsSchema,
  updateTechnicalSkillSchema,
} from "../validation/skills.validate";
import {
  getSkillsController,
  insertSkillsController,
  updateAwardsController,
  updatePersonalSkillController,
  updateTechnicalSkillsController,
} from "../controllers/skills/skills.controller";

const router = Router();

router.post(
  "/skills",
  isAuthenticated,
  validateBody(addSkillSchema),
  insertSkillsController,
);

router.get("/skills", isAuthenticated, getSkillsController);

router.put(
  "/skills/personalSkills/:skillId",
  isAuthenticated,
  validateBody(updatePersonalSkillsSchema),
  updatePersonalSkillController,
);
router.put(
  "/skills/technicalSkills/:skillId",
  isAuthenticated,
  validateBody(updateTechnicalSkillSchema),
  updateTechnicalSkillsController,
);
router.put(
  "/skills/awards/:skillId",
  isAuthenticated,
  validateBody(updateAwardSkillsSchema),
  updateAwardsController,
);

export default router;
