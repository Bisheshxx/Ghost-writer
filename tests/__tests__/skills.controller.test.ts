import { getAuth } from "@clerk/express";
import {
  getSkillsController,
  insertSkillsController,
  updateAwardsController,
  updatePersonalSkillController,
  updateTechnicalSkillsController,
} from "../../src/controllers/skills/skills.controller";
import * as SkillsService from "../../src/services/skills.service";
import { ApiError } from "../../src/utils/apiError";
import { sendSuccessResponse } from "../../src/utils/responseFormatter";

jest.mock("@clerk/express", () => ({
  getAuth: jest.fn(),
}));

jest.mock("../../src/services/skills.service", () => ({
  createSkillsService: jest.fn(),
  getSkillsService: jest.fn(),
  updateSkillByName: jest.fn(),
}));

jest.mock("../../src/utils/responseFormatter", () => ({
  sendSuccessResponse: jest.fn(),
}));

describe("skills controllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("insertSkillsController", () => {
    it("returns 401 when user is not authenticated", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: null });

      const req = { body: { skills: {} } } as any;
      const res = {} as any;
      const next = jest.fn();

      await insertSkillsController(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: "UNAUTHORIZED",
        }),
      );
      expect(SkillsService.createSkillsService).not.toHaveBeenCalled();
    });

    it("calls create service and sends response", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (SkillsService.createSkillsService as jest.Mock).mockResolvedValue({
        _id: "skill_1",
      });

      const req = {
        body: {
          skills: {
            technicalSkills: [],
            personalSkills: [],
            awards: [],
          },
        },
      } as any;
      const res = {} as any;
      const next = jest.fn();

      await insertSkillsController(req, res, next);

      expect(SkillsService.createSkillsService).toHaveBeenCalledWith(
        "user_123",
        req.body.skills,
      );
      expect(sendSuccessResponse).toHaveBeenCalledWith(res, 200, {
        _id: "skill_1",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("getSkillsController", () => {
    it("returns 401 when user is not authenticated", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: null });

      const req = {} as any;
      const res = {} as any;
      const next = jest.fn();

      await getSkillsController(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: "UNAUTHORIZED",
        }),
      );
      expect(SkillsService.getSkillsService).not.toHaveBeenCalled();
    });

    it("returns skills for authenticated user", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (SkillsService.getSkillsService as jest.Mock).mockResolvedValue([
        { _id: "skill_1" },
      ]);

      const req = {} as any;
      const res = {} as any;
      const next = jest.fn();

      await getSkillsController(req, res, next);

      expect(SkillsService.getSkillsService).toHaveBeenCalledWith("user_123");
      expect(sendSuccessResponse).toHaveBeenCalledWith(res, 200, [
        { _id: "skill_1" },
      ]);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("updatePersonalSkillController", () => {
    it("returns 401 when user is not authenticated", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: null });

      const req = {
        params: { skillId: "skill_1" },
        body: { personalSkills: ["communication"] },
      } as any;
      const res = {} as any;
      const next = jest.fn();

      await updatePersonalSkillController(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: "UNAUTHORIZED",
        }),
      );
      expect(SkillsService.updateSkillByName).not.toHaveBeenCalled();
    });

    it("updates personal skills", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (SkillsService.updateSkillByName as jest.Mock).mockResolvedValue({
        personalSkills: ["communication"],
      });

      const req = {
        params: { skillId: "skill_1" },
        body: { personalSkills: ["communication"] },
      } as any;
      const res = {} as any;
      const next = jest.fn();

      await updatePersonalSkillController(req, res, next);

      expect(SkillsService.updateSkillByName).toHaveBeenCalledWith(
        "user_123",
        "skill_1",
        "personalSkills",
        ["communication"],
      );
      expect(sendSuccessResponse).toHaveBeenCalledWith(res, 200, {
        personalSkills: ["communication"],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("updateTechnicalSkillsController", () => {
    it("updates technical skills", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (SkillsService.updateSkillByName as jest.Mock).mockResolvedValue({
        technicalSkills: [],
      });

      const req = {
        params: { skillId: "skill_1" },
        body: { technicalSkills: [] },
      } as any;
      const res = {} as any;
      const next = jest.fn();

      await updateTechnicalSkillsController(req, res, next);

      expect(SkillsService.updateSkillByName).toHaveBeenCalledWith(
        "user_123",
        "skill_1",
        "technicalSkills",
        [],
      );
      expect(sendSuccessResponse).toHaveBeenCalledWith(res, 200, {
        technicalSkills: [],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("updateAwardsController", () => {
    it("returns 401 when user is not authenticated", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: null });

      const req = {
        params: { skillId: "skill_1" },
        body: { awards: [] },
      } as any;
      const res = {} as any;
      const next = jest.fn();

      await updateAwardsController(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: "UNAUTHORIZED",
        }),
      );
      expect(SkillsService.updateSkillByName).not.toHaveBeenCalled();
    });

    it("updates awards", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (SkillsService.updateSkillByName as jest.Mock).mockResolvedValue({
        awards: [
          {
            title: "Best Developer",
            details: "Awarded for outstanding performance",
            issuedDate: "2023-05-01",
            issuer: "Tech Company",
          },
        ],
      });

      const req = {
        params: { skillId: "skill_1" },
        body: {
          awards: [
            {
              title: "Best Developer",
              details: "Awarded for outstanding performance",
              issuedDate: "2023-05-01",
              issuer: "Tech Company",
            },
          ],
        },
      } as any;
      const res = {} as any;
      const next = jest.fn();

      await updateAwardsController(req, res, next);

      expect(SkillsService.updateSkillByName).toHaveBeenCalledWith(
        "user_123",
        "skill_1",
        "awards",
        [
          {
            title: "Best Developer",
            details: "Awarded for outstanding performance",
            issuedDate: "2023-05-01",
            issuer: "Tech Company",
          },
        ],
      );
      expect(sendSuccessResponse).toHaveBeenCalledWith(res, 200, {
        awards: [
          {
            title: "Best Developer",
            details: "Awarded for outstanding performance",
            issuedDate: "2023-05-01",
            issuer: "Tech Company",
          },
        ],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
