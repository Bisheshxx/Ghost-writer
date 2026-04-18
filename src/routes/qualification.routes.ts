import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  CreateQualificationSchema,
  UpdateQualificationSchema,
} from "../validation/qualification.validate";
import { asyncHandler } from "../utils/express-async-errors";
import {
  createQualificationController,
  deleteQualificationController,
  getQualificationController,
  updateQualificationController,
} from "../controllers/qualification/qualification.controller";

const router = Router();
router.post(
  "/qualification",
  isAuthenticated,
  validateBody(CreateQualificationSchema),
  asyncHandler(createQualificationController),
);
router.get(
  "/qualification",
  isAuthenticated,
  asyncHandler(getQualificationController),
);
router.patch(
  "/qualification/:qualificationId",
  isAuthenticated,
  validateBody(UpdateQualificationSchema),
  asyncHandler(updateQualificationController),
);

router.delete(
  "/qualification/:qualificationId",
  isAuthenticated,
  asyncHandler(deleteQualificationController),
);

export default router;
