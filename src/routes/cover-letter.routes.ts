import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { CoverLetterSchema } from "../validation/cover-lettter.validate";
import { asyncHandler } from "../utils/express-async-errors";
import { generateCoverLetterController } from "../controllers/cover-lettter/cover-lettter.controller";

const router = Router();

router.post(
  "/generate-cover-letter",
  isAuthenticated,
  validateBody(CoverLetterSchema),
  asyncHandler(generateCoverLetterController),
);
export default router;
