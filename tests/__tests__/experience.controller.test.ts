import { getAuth } from "@clerk/express";
import {
  deleteExperienceController,
  getExperienceController,
  insertExperienceController,
  updateExperienceController,
} from "../../src/controllers/experience/experience.controller";
import * as ExperienceService from "../../src/services/experience.service";
import { sendSuccessResponse } from "../../src/utils/responseFormatter";

jest.mock("@clerk/express", () => ({
  getAuth: jest.fn(),
}));

jest.mock("../../src/services/experience.service", () => ({
  createdExperiencesService: jest.fn(),
  getExperienceService: jest.fn(),
  updateExperienceService: jest.fn(),
  deleteExperienceService: jest.fn(),
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
    expect(ExperienceService.createdExperiencesService).not.toHaveBeenCalled();
  });

  it("calls service and sends success response for authenticated user", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
    const serviceResult = [{ _id: "exp_1" }];
    (
      ExperienceService.createdExperiencesService as jest.Mock
    ).mockResolvedValue(serviceResult);

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

    expect(ExperienceService.createdExperiencesService).toHaveBeenCalledWith(
      "user_123",
      req.body.experiences,
    );
    expect(sendSuccessResponse).toHaveBeenCalledWith(res, 200, serviceResult);
    expect(next).not.toHaveBeenCalled();
  });

  it("throws when service rejects", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
    (
      ExperienceService.createdExperiencesService as jest.Mock
    ).mockRejectedValue(new Error("service failed"));

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

describe("getExperienceController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls next with 401 ApiError when userId is missing", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: null });

    const req = {} as any;
    const res = {} as any;
    const next = jest.fn();

    await getExperienceController(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
    expect(ExperienceService.getExperienceService).not.toHaveBeenCalled();
  });

  it("calls service and sends success response for authenticated user", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
    const serviceResult = [{ _id: "exp_1" }];
    (ExperienceService.getExperienceService as jest.Mock).mockResolvedValue(
      serviceResult,
    );

    const req = {} as any;
    const res = {} as any;
    const next = jest.fn();

    await getExperienceController(req, res, next);

    expect(ExperienceService.getExperienceService).toHaveBeenCalledWith(
      "user_123",
    );
    expect(sendSuccessResponse).toHaveBeenCalledWith(res, 200, serviceResult);
    expect(next).not.toHaveBeenCalled();
  });

  it("throws when service rejects", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
    (ExperienceService.getExperienceService as jest.Mock).mockRejectedValue(
      new Error("service failed"),
    );

    const req = {} as any;
    const res = {} as any;
    const next = jest.fn();

    await expect(getExperienceController(req, res, next)).rejects.toThrow(
      "service failed",
    );
  });
});

describe("updateExperienceController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls next with 401 ApiError when userId is missing", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: null });

    const req = {
      params: { experienceId: "exp_1" },
      body: { jobTitle: "Senior" },
    } as any;
    const res = {} as any;
    const next = jest.fn();

    await updateExperienceController(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
    expect(ExperienceService.updateExperienceService).not.toHaveBeenCalled();
  });

  it("calls service and sends success response for authenticated user", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
    const serviceResult = { _id: "exp_1", jobTitle: "Senior" };
    (ExperienceService.updateExperienceService as jest.Mock).mockResolvedValue(
      serviceResult,
    );

    const req = {
      params: { experienceId: "exp_1" },
      body: { jobTitle: "Senior" },
    } as any;
    const res = {} as any;
    const next = jest.fn();

    await updateExperienceController(req, res, next);

    expect(ExperienceService.updateExperienceService).toHaveBeenCalledWith(
      "user_123",
      "exp_1",
      { jobTitle: "Senior" },
    );
    expect(sendSuccessResponse).toHaveBeenCalledWith(res, 200, serviceResult);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("deleteExperienceController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls next with 401 ApiError when userId is missing", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: null });

    const req = {
      params: { experienceId: "exp_1" },
    } as any;
    const res = {} as any;
    const next = jest.fn();

    await deleteExperienceController(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
    expect(ExperienceService.deleteExperienceService).not.toHaveBeenCalled();
  });

  it("calls delete service and sends success response for authenticated user", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
    (ExperienceService.deleteExperienceService as jest.Mock).mockResolvedValue(
      null,
    );

    const req = {
      params: { experienceId: "exp_1" },
    } as any;
    const res = {} as any;
    const next = jest.fn();

    await deleteExperienceController(req, res, next);

    expect(ExperienceService.deleteExperienceService).toHaveBeenCalledWith(
      "user_123",
      "exp_1",
    );
    expect(sendSuccessResponse).toHaveBeenCalledWith(res, 204, null);
    expect(next).not.toHaveBeenCalled();
  });
});
