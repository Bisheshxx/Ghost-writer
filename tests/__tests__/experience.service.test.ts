import {
  createdExperiencesService,
  getExperienceService,
} from "../../src/services/experience.service";
import { Experience } from "../../src/models/experience.model";
import * as UserService from "../../src/services/user.service";
import { ApiError } from "../../src/utils/apiError";

jest.mock("../../src/models/experience.model", () => ({
  Experience: {
    insertMany: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock("../../src/services/user.service", () => ({
  resolveUserIdByClerkId: jest.fn(),
}));

describe("ExperienceService.createdExperiencesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws 400 when experiences array is empty", async () => {
    await expect(
      createdExperiencesService("user_123", []),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: "BAD_REQUEST",
    });
  });

  it("throws 404 when mapped user does not exist", async () => {
    (UserService.resolveUserIdByClerkId as jest.Mock).mockRejectedValue(
      new ApiError(404, "User not found", "NOT_FOUND"),
    );

    await expect(
      createdExperiencesService("user_123", [
        {
          companyName: "Acme",
          jobTitle: "Backend Engineer",
          Descriptions: "Built APIs",
          startDate: "2024-01",
          isCurrent: true,
          endDate: null,
          relavantDetails: null,
        },
      ]),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
      message: "User not found",
    });
  });

  it("maps user _id and inserts many experiences", async () => {
    (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
      "mongo_user_1",
    );
    (Experience.insertMany as jest.Mock).mockResolvedValue([
      { _id: "exp_1" },
      { _id: "exp_2" },
    ]);

    const payload = [
      {
        companyName: "Acme",
        jobTitle: "Backend Engineer",
        Descriptions: "Built APIs",
        startDate: "2024-01",
        isCurrent: true,
        endDate: null,
        relavantDetails: null,
      },
      {
        companyName: "Beta",
        jobTitle: "Intern",
        Descriptions: "Built tools",
        startDate: "2023-01",
        isCurrent: false,
        endDate: "2023-12",
        relavantDetails: "Jest",
      },
    ];

    const result = await createdExperiencesService("user_123", payload);

    expect(UserService.resolveUserIdByClerkId).toHaveBeenCalledWith("user_123");
    expect(Experience.insertMany).toHaveBeenCalledWith([
      { ...payload[0], user: "mongo_user_1" },
      { ...payload[1], user: "mongo_user_1" },
    ]);
    expect(result).toEqual([{ _id: "exp_1" }, { _id: "exp_2" }]);
  });

  it("propagates insertMany database failures", async () => {
    (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
      "mongo_user_1",
    );
    (Experience.insertMany as jest.Mock).mockRejectedValue(
      new Error("insert failed"),
    );

    await expect(
      createdExperiencesService("user_123", [
        {
          companyName: "Acme",
          jobTitle: "Backend Engineer",
          Descriptions: "Built APIs",
          startDate: "2024-01",
          isCurrent: true,
          endDate: null,
          relavantDetails: null,
        },
      ]),
    ).rejects.toThrow("insert failed");
  });
});

describe("ExperienceService.getExperienceService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches only the authenticated user's experiences", async () => {
    (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
      "mongo_user_1",
    );
    const sortMock = jest.fn().mockResolvedValue([{ _id: "exp_1" }]);
    (Experience.find as jest.Mock).mockReturnValue({ sort: sortMock });

    const result = await getExperienceService("user_123");

    expect(UserService.resolveUserIdByClerkId).toHaveBeenCalledWith("user_123");
    expect(Experience.find).toHaveBeenCalledWith({ user: "mongo_user_1" });
    expect(sortMock).toHaveBeenCalledWith({ startDate: -1 });
    expect(result).toEqual([{ _id: "exp_1" }]);
  });

  it("propagates query failures", async () => {
    (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
      "mongo_user_1",
    );
    const sortMock = jest.fn().mockRejectedValue(new Error("query failed"));
    (Experience.find as jest.Mock).mockReturnValue({ sort: sortMock });

    await expect(getExperienceService("user_123")).rejects.toThrow(
      "query failed",
    );
  });
});
