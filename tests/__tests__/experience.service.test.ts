import { handleExperienceCreated } from "../../src/services/experience.service";
import { Experience } from "../../src/models/experience.model";
import { User } from "../../src/models/user.model";
import { ApiError } from "../../src/utils/apiError";

jest.mock("../../src/models/experience.model", () => ({
  Experience: {
    insertMany: jest.fn(),
  },
}));

jest.mock("../../src/models/user.model", () => ({
  User: {
    findOne: jest.fn(),
  },
}));

describe("ExperienceService.handleExperienceCreated", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws 400 when experiences array is empty", async () => {
    await expect(handleExperienceCreated("user_123", [])).rejects.toMatchObject(
      {
        statusCode: 400,
        code: "BAD_REQUEST",
      },
    );
  });

  it("throws 404 when mapped user does not exist", async () => {
    const selectMock = jest.fn().mockResolvedValue(null);
    (User.findOne as jest.Mock).mockReturnValue({ select: selectMock });

    await expect(
      handleExperienceCreated("user_123", [
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
    const selectMock = jest.fn().mockResolvedValue({ _id: "mongo_user_1" });
    (User.findOne as jest.Mock).mockReturnValue({ select: selectMock });
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

    const result = await handleExperienceCreated("user_123", payload);

    expect(User.findOne).toHaveBeenCalledWith({ clerkId: "user_123" });
    expect(selectMock).toHaveBeenCalledWith("_id");
    expect(Experience.insertMany).toHaveBeenCalledWith([
      { ...payload[0], user: "mongo_user_1" },
      { ...payload[1], user: "mongo_user_1" },
    ]);
    expect(result).toEqual([{ _id: "exp_1" }, { _id: "exp_2" }]);
  });

  it("propagates insertMany database failures", async () => {
    const selectMock = jest.fn().mockResolvedValue({ _id: "mongo_user_1" });
    (User.findOne as jest.Mock).mockReturnValue({ select: selectMock });
    (Experience.insertMany as jest.Mock).mockRejectedValue(
      new Error("insert failed"),
    );

    await expect(
      handleExperienceCreated("user_123", [
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
