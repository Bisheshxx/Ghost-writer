import { Router } from "express";
import express from "express";
import { handleClerkWebhook } from "../controllers/webhook/ClerkController";

const router = Router();

router
  .route("/webhooks")
  .post(express.raw({ type: "application/json" }), handleClerkWebhook);

export default router;
