import {
  handleUserCreated,
  resolveUserIdByClerkId,
} from "../../src/services/user.service";
import { User } from "../../src/models/user.model";
import { ApiError } from "../../src/utils/apiError";

jest.mock("../../src/models/user.model", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

describe("UserService.handleUserCreated", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a user when clerkId does not exist", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    const createdUser = { _id: "db_1", clerkId: "user_1" };
    (User.create as jest.Mock).mockResolvedValue(createdUser);

    const result = await handleUserCreated("user_1");

    expect(User.findOne).toHaveBeenCalledWith({ clerkId: "user_1" });
    expect(User.create).toHaveBeenCalledWith({ clerkId: "user_1" });
    expect(result).toEqual(createdUser);
  });

  it("throws ApiError(409) when user already exists", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({ _id: "db_existing" });

    await expect(handleUserCreated("user_1")).rejects.toMatchObject({
      statusCode: 409,
      message: "User already exists in database",
      code: "CONFLICT",
    });

    await expect(handleUserCreated("user_1")).rejects.toBeInstanceOf(ApiError);
    expect(User.create).not.toHaveBeenCalled();
  });

  it("propagates database create errors", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (User.create as jest.Mock).mockRejectedValue(new Error("DB create failed"));

    await expect(handleUserCreated("user_1")).rejects.toThrow(
      "DB create failed",
    );
  });
});

describe("UserService.resolveUserIdByClerkId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns mapped mongo _id when user exists", async () => {
    const selectMock = jest.fn().mockResolvedValue({ _id: "mongo_user_1" });
    (User.findOne as jest.Mock).mockReturnValue({ select: selectMock });

    const result = await resolveUserIdByClerkId("user_123");

    expect(User.findOne).toHaveBeenCalledWith({ clerkId: "user_123" });
    expect(selectMock).toHaveBeenCalledWith("_id");
    expect(result).toBe("mongo_user_1");
  });

  it("throws ApiError(404) when mapped user does not exist", async () => {
    const selectMock = jest.fn().mockResolvedValue(null);
    (User.findOne as jest.Mock).mockReturnValue({ select: selectMock });

    await expect(resolveUserIdByClerkId("user_123")).rejects.toMatchObject({
      statusCode: 404,
      message: "User not found",
      code: "NOT_FOUND",
    });
    await expect(resolveUserIdByClerkId("user_123")).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});
