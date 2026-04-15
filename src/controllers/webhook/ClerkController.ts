import type { Request, Response } from "express";
import { verifyWebhook } from "@clerk/express/webhooks"; // or @clerk/backend

export const handleClerkWebhook = async (req: Request, res: Response) => {
  try {
    const evt = await verifyWebhook(req);

    const { type, data } = evt;
    const { id } = data;

    switch (type) {
      case "user.created":
      case "user.updated": {
        //add this id to the database mongo db
        break;
      }
      case "user.deleted": {
        //delete this id to the database mongo db
        break;
      }
    }

    console.log("Webhook payload:", evt.data);

    return res.send({ messages: "Webhook received", data: evt.data });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return res.status(400).send("Error verifying webhook");
  }
};
