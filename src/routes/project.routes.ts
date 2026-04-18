import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  CreateProjectSchema,
  UpdateProjectSchema,
} from "../validation/projects.validate";
import { asyncHandler } from "../utils/express-async-errors";
import {
  createProjectController,
  deleteProjectController,
  getProjectController,
  updateProjectController,
} from "../controllers/project/project.controller";

const router = Router();
router.post(
  "/project",
  isAuthenticated,
  validateBody(CreateProjectSchema),
  asyncHandler(createProjectController),
);
router.get("/project", isAuthenticated, getProjectController);
router.patch(
  "/project/:projectId",
  isAuthenticated,
  validateBody(UpdateProjectSchema),
  asyncHandler(updateProjectController),
);
router.delete(
  "/project/:projectId",
  isAuthenticated,
  asyncHandler(deleteProjectController),
);

export default router;
