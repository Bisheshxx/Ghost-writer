import { handleUserCreated } from "../../src/services/user.service";
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
