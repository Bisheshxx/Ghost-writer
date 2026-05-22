import { Router } from "express";
import {
  createJobController,
  deleteJobController,
  generateCoverLetterController,
  generateResumeController,
  getJobController,
  listJobsController,
  updateJobController,
  updateJobStatusController,
} from "../controllers/jobs/jobs.controller";
import { isAuthenticated } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../utils/express-async-errors";
import {
  CreateJobSchema,
  UpdateJobSchema,
  UpdateJobStatusSchema,
} from "../validation/jobs.validate";

const router = Router();

router.get("/jobs", isAuthenticated, asyncHandler(listJobsController));
router.post(
  "/jobs",
  isAuthenticated,
  validateBody(CreateJobSchema),
  asyncHandler(createJobController),
);
router.patch(
  "/jobs/:id/status",
  isAuthenticated,
  validateBody(UpdateJobStatusSchema),
  asyncHandler(updateJobStatusController),
);
router.post(
  "/jobs/:id/generate/resume",
  isAuthenticated,
  asyncHandler(generateResumeController),
);
router.post(
  "/jobs/:id/generate/cover-letter",
  isAuthenticated,
  asyncHandler(generateCoverLetterController),
);
router.get("/jobs/:id", isAuthenticated, asyncHandler(getJobController));
router.patch(
  "/jobs/:id",
  isAuthenticated,
  validateBody(UpdateJobSchema),
  asyncHandler(updateJobController),
);
router.delete("/jobs/:id", isAuthenticated, asyncHandler(deleteJobController));

export default router;
