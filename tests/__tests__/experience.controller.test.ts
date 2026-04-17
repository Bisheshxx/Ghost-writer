import { getAuth } from "@clerk/express";
import { insertExperienceController } from "../../src/controllers/experience/experience.controller";
import * as ExperienceService from "../../src/services/experience.service";
import { sendSuccessResponse } from "../../src/utils/responseFormatter";

jest.mock("@clerk/express", () => ({
  getAuth: jest.fn(),
}));

jest.mock("../../src/services/experience.service", () => ({
  handleExperienceCreated: jest.fn(),
}));

jest.mock("../../src/utils/responseFormatter", () => ({
  sendSuccessResponse: jest.fn(),
}));

describe("insertExperienceController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls next with 401 ApiError when userId is missing", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: null });

    const req = {
      body: { experiences: [] },
    } as any;
    const res = {} as any;
    const next = jest.fn();

    await insertExperienceController(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
    expect(ExperienceService.handleExperienceCreated).not.toHaveBeenCalled();
  });

  it("calls service and sends success response for authenticated user", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
    const serviceResult = [{ _id: "exp_1" }];
    (ExperienceService.handleExperienceCreated as jest.Mock).mockResolvedValue(
      serviceResult,
    );

    const req = {
      body: {
        experiences: [
          {
            companyName: "Acme",
            jobTitle: "Backend Engineer",
            Descriptions: "Built APIs",
            startDate: "2024-01",
            isCurrent: true,
            endDate: null,
          },
        ],
      },
    } as any;
    const res = {} as any;
    const next = jest.fn();

    await insertExperienceController(req, res, next);

    expect(ExperienceService.handleExperienceCreated).toHaveBeenCalledWith(
      "user_123",
      req.body.experiences,
    );
    expect(sendSuccessResponse).toHaveBeenCalledWith(res, 200, serviceResult);
    expect(next).not.toHaveBeenCalled();
  });

  it("throws when service rejects", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
    (ExperienceService.handleExperienceCreated as jest.Mock).mockRejectedValue(
      new Error("service failed"),
    );

    const req = {
      body: {
        experiences: [
          {
            companyName: "Acme",
            jobTitle: "Backend Engineer",
            Descriptions: "Built APIs",
            startDate: "2024-01",
            isCurrent: true,
            endDate: null,
          },
        ],
      },
    } as any;
    const res = {} as any;
    const next = jest.fn();

    await expect(insertExperienceController(req, res, next)).rejects.toThrow(
      "service failed",
    );
  });
});
