// src/controllers/user.controller.ts
import { Request, Response } from "express";
import * as userService from "../../services/user.service";

export const clerkWebhookHandler = async (req: Request, res: Response) => {
  const { id } = req.body.data;

  const newUser = await userService.handleUserCreated(id);

  res.status(201).json({
    success: true,
    data: newUser,
  });
};
