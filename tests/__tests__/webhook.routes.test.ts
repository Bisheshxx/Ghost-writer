import request from "supertest";
import app from "../../src/app";
import * as UserService from "../../src/services/user.service";
import { verifyWebhook } from "@clerk/express/webhooks";
import { ApiError } from "../../src/utils/apiError";

jest.mock("@clerk/express/webhooks");
jest.mock("../../src/services/user.service");

describe("Webhook Routes", () => {
  describe("POST /api/v1/webhooks", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    // user.created event tests

    describe("user.created event", () => {
      it("should successfully create a user with valid user.created event", async () => {
        const mockPayload = {
          type: "user.created",
          data: {
            id: "user_123",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
          },
        };

        (verifyWebhook as jest.Mock).mockResolvedValue(mockPayload);
        (UserService.handleUserCreated as jest.Mock).mockResolvedValue({
          _id: "db_123",
          clerkId: "user_123",
          email: "john@example.com",
          createdAt: new Date(),
        });

        const response = await request(app)
          .post("/api/v1/webhooks")
          .set("Content-Type", "application/json")
          .send({ some: "payload" });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty("clerkId", "user_123");
        expect(UserService.handleUserCreated).toHaveBeenCalledWith("user_123");
        expect(UserService.handleUserCreated).toHaveBeenCalledTimes(1);
      });

      it("should return 400 error when user ID is missing", async () => {
        const mockPayload = {
          type: "user.created",
          data: { id: undefined },
        };

        (verifyWebhook as jest.Mock).mockResolvedValue(mockPayload);

        const response = await request(app)
          .post("/api/v1/webhooks")
          .set("Content-Type", "application/json")
          .send({ some: "payload" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe("MISSING_USER_ID");
        expect(UserService.handleUserCreated).not.toHaveBeenCalled();
      });

      it("should return 409 conflict when user already exists", async () => {
        const mockPayload = {
          type: "user.created",
          data: { id: "user_123" },
        };

        (verifyWebhook as jest.Mock).mockResolvedValue(mockPayload);
        (UserService.handleUserCreated as jest.Mock).mockRejectedValue(
          new ApiError(409, "User already exists in database", "CONFLICT"),
        );

        const response = await request(app)
          .post("/api/v1/webhooks")
          .set("Content-Type", "application/json")
          .send({ some: "payload" });

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe("CONFLICT");
        expect(UserService.handleUserCreated).toHaveBeenCalledWith("user_123");
      });
    });

    // user.updated event tests

    describe("user.updated event", () => {
      it("should successfully handle user.updated event", async () => {
        const mockPayload = {
          type: "user.updated",
          data: {
            id: "user_123",
            firstName: "Jane",
            email: "jane@example.com",
          },
        };

        (verifyWebhook as jest.Mock).mockResolvedValue(mockPayload);
        (UserService.handleUserCreated as jest.Mock).mockResolvedValue({
          _id: "db_123",
          clerkId: "user_123",
          email: "jane@example.com",
        });

        const response = await request(app)
          .post("/api/v1/webhooks")
          .set("Content-Type", "application/json")
          .send({ some: "payload" });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(UserService.handleUserCreated).toHaveBeenCalledWith("user_123");
      });
    });

    // user.deleted event tests

    describe("user.deleted event", () => {
      it("should successfully handle user.deleted event", async () => {
        const mockPayload = {
          type: "user.deleted",
          data: { id: "user_123" },
        };

        (verifyWebhook as jest.Mock).mockResolvedValue(mockPayload);

        const response = await request(app)
          .post("/api/v1/webhooks")
          .set("Content-Type", "application/json")
          .send({ some: "payload" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBe("User deleted event received");
      });
    });

    // webhook verification error tests

    describe("webhook verification failures", () => {
      it("should return 400 error when webhook signature verification fails", async () => {
        (verifyWebhook as jest.Mock).mockRejectedValue(
          new Error("Invalid signature"),
        );

        const response = await request(app)
          .post("/api/v1/webhooks")
          .set("Content-Type", "application/json")
          .send({ some: "payload" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe("WEBHOOK_VERIFICATION_FAILED");
        expect(UserService.handleUserCreated).not.toHaveBeenCalled();
      });
    });

    // response format tests

    describe("response format validation", () => {
      it("should return correctly formatted success response", async () => {
        const mockPayload = {
          type: "user.created",
          data: { id: "user_123" },
        };

        (verifyWebhook as jest.Mock).mockResolvedValue(mockPayload);
        (UserService.handleUserCreated as jest.Mock).mockResolvedValue({
          _id: "db_123",
          clerkId: "user_123",
        });

        const response = await request(app)
          .post("/api/v1/webhooks")
          .set("Content-Type", "application/json")
          .send({ some: "payload" });

        expect(response.body).toHaveProperty("success");
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("timestamp");
        expect(typeof response.body.success).toBe("boolean");
        expect(typeof response.body.timestamp).toBe("string");
      });

      it("should return correctly formatted error response", async () => {
        const mockPayload = {
          type: "user.created",
          data: { id: undefined },
        };

        (verifyWebhook as jest.Mock).mockResolvedValue(mockPayload);

        const response = await request(app)
          .post("/api/v1/webhooks")
          .set("Content-Type", "application/json")
          .send({ some: "payload" });

        expect(response.body).toHaveProperty("success");
        expect(response.body).toHaveProperty("error");
        expect(response.body).toHaveProperty("timestamp");
        expect(response.body.error).toHaveProperty("message");
        expect(response.body.error).toHaveProperty("code");
      });
    });
  });
});
