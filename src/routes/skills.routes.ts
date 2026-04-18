import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { addSkillSchema } from "../validation/skills.validate";
import {
  getSkillsController,
  insertSkillsController,
} from "../controllers/skills/skills.controller";

const router = Router();

router.post(
  "/skills",
  isAuthenticated,
  validateBody(addSkillSchema),
  insertSkillsController,
);

router.get("/skills", isAuthenticated, getSkillsController);

export default router;
