import { handleClerkWebhook } from "../../src/controllers/webhook/ClerkController";
import { verifyWebhook } from "@clerk/express/webhooks";
import * as UserService from "../../src/services/user.service";
import { ApiError } from "../../src/utils/apiError";

type MockResponse = {
  status: jest.Mock;
  json: jest.Mock;
};

jest.mock("@clerk/express/webhooks", () => ({
  verifyWebhook: jest.fn(),
}));

jest.mock("../../src/services/user.service", () => ({
  handleUserCreated: jest.fn(),
}));

const createMockRes = (): MockResponse => {
  const status = jest.fn().mockReturnThis();
  const json = jest.fn().mockReturnThis();
  return { status, json };
};

describe("handleClerkWebhook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 201 for user.created with valid id", async () => {
    const req = {} as any;
    const res = createMockRes();
    const next = jest.fn();

    (verifyWebhook as jest.Mock).mockResolvedValue({
      type: "user.created",
      data: { id: "user_123" },
    });
    (UserService.handleUserCreated as jest.Mock).mockResolvedValue({
      clerkId: "user_123",
    });

    await handleClerkWebhook(req, res as any, next);

    expect(UserService.handleUserCreated).toHaveBeenCalledWith("user_123");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: { clerkId: "user_123" } }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when user.created payload is missing id", async () => {
    const req = {} as any;
    const res = createMockRes();
    const next = jest.fn();

    (verifyWebhook as jest.Mock).mockResolvedValue({
      type: "user.created",
      data: {},
    });

    await handleClerkWebhook(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: { message: "Missing user ID", code: "MISSING_USER_ID" },
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 200 for user.deleted", async () => {
    const req = {} as any;
    const res = createMockRes();
    const next = jest.fn();

    (verifyWebhook as jest.Mock).mockResolvedValue({
      type: "user.deleted",
      data: { id: "user_123" },
    });

    await handleClerkWebhook(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: { message: "User deleted event received" },
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards ApiError from service to next", async () => {
    const req = {} as any;
    const res = createMockRes();
    const next = jest.fn();
    const serviceError = new ApiError(409, "Conflict", "CONFLICT");

    (verifyWebhook as jest.Mock).mockResolvedValue({
      type: "user.created",
      data: { id: "user_123" },
    });
    (UserService.handleUserCreated as jest.Mock).mockRejectedValue(
      serviceError,
    );

    await handleClerkWebhook(req, res as any, next);

    expect(next).toHaveBeenCalledWith(serviceError);
  });

  it("converts verification errors to WEBHOOK_VERIFICATION_FAILED ApiError", async () => {
    const req = {} as any;
    const res = createMockRes();
    const next = jest.fn();

    (verifyWebhook as jest.Mock).mockRejectedValue(new Error("bad signature"));

    await handleClerkWebhook(req, res as any, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        code: "WEBHOOK_VERIFICATION_FAILED",
        message: "Error verifying webhook",
      }),
    );
  });
});
