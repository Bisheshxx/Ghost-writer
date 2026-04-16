import { Router } from "express";
import express from "express";
import { handleClerkWebhook } from "../controllers/webhook/ClerkController";

const router = Router();

// We use express.raw to ensure the webhook signature can be verified correctly
router.post("/", express.raw({ type: "application/json" }), handleClerkWebhook);

export default router;
