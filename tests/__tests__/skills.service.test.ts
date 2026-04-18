import { Types } from "mongoose";
import { Skills } from "../../src/models/skills.model";
import {
  createSkillsService,
  getSkillByName,
  getSkillsService,
  updateSkillByName,
} from "../../src/services/skills.service";
import * as UserService from "../../src/services/user.service";
import { ApiError } from "../../src/utils/apiError";
import { SkillName } from "../../src/types/skills.types";

jest.mock("../../src/models/skills.model", () => ({
  Skills: {
    insertOne: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

jest.mock("../../src/services/user.service", () => ({
  resolveUserIdByClerkId: jest.fn(),
}));

describe("SkillsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createSkillsService", () => {
    it("throws 400 when skills payload is empty", async () => {
      await expect(createSkillsService("user_123", undefined as never)).rejects.toMatchObject({
        statusCode: 400,
        code: "BAD_REQUEST",
        message: "Skills cannot be empty",
      });
    });

    it("creates skills for the resolved user", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        new Types.ObjectId("64b64b64b64b64b64b64b64b"),
      );
      (Skills.insertOne as jest.Mock).mockResolvedValue({ _id: "skill_1" });

      const payload = {
        technicalSkills: [
          { category: "Frontend", technologies: ["React", "TypeScript"] },
        ],
        personalSkills: ["communication"],
        awards: [],
      };

      const result = await createSkillsService("user_123", payload as never);

      expect(UserService.resolveUserIdByClerkId).toHaveBeenCalledWith("user_123");
      expect(Skills.insertOne).toHaveBeenCalledWith({
        user: expect.any(Types.ObjectId),
        ...payload,
      });
      expect(result).toEqual({ _id: "skill_1" });
    });
  });

  describe("getSkillsService", () => {
    it("returns skills sorted by newest first", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        new Types.ObjectId("64b64b64b64b64b64b64b64b"),
      );
      const sortMock = jest.fn().mockResolvedValue([{ _id: "skill_1" }]);
      (Skills.find as jest.Mock).mockReturnValue({ sort: sortMock });

      const result = await getSkillsService("user_123");

      expect(Skills.find).toHaveBeenCalledWith({
        user: expect.any(Types.ObjectId),
      });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual([{ _id: "skill_1" }]);
    });
  });

  describe("getSkillByName", () => {
    it("throws 404 when skills document does not exist", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        new Types.ObjectId("64b64b64b64b64b64b64b64b"),
      );
      const selectMock = jest.fn().mockResolvedValue(null);
      (Skills.findOne as jest.Mock).mockReturnValue({ select: selectMock });

      await expect(
        getSkillByName("user_123", "skill_1", SkillName.TechnicalSkills),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "NOT_FOUND",
        message: "Skills not found",
      });
    });

    it("returns selected skill document", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        new Types.ObjectId("64b64b64b64b64b64b64b64b"),
      );
      const selectedDoc = { technicalSkills: [{ category: "Frontend" }] };
      const selectMock = jest.fn().mockResolvedValue(selectedDoc);
      (Skills.findOne as jest.Mock).mockReturnValue({ select: selectMock });

      const result = await getSkillByName(
        "user_123",
        "skill_1",
        SkillName.TechnicalSkills,
      );

      expect(Skills.findOne).toHaveBeenCalledWith({
        _id: "skill_1",
        user: expect.any(Types.ObjectId),
      });
      expect(selectMock).toHaveBeenCalledWith(SkillName.TechnicalSkills);
      expect(result).toEqual(selectedDoc);
    });
  });

  describe("updateSkillByName", () => {
    it("throws 400 when skill value is empty", async () => {
      await expect(
        updateSkillByName(
          "user_123",
          "skill_1",
          SkillName.PersonalSkills,
          undefined as never,
        ),
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "BAD_REQUEST",
        message: "personalSkills cannot be empty",
      });
    });

    it("throws 404 when skills document is not found", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        new Types.ObjectId("64b64b64b64b64b64b64b64b"),
      );
      const selectMock = jest.fn().mockResolvedValue(null);
      (Skills.findOneAndUpdate as jest.Mock).mockReturnValue({ select: selectMock });

      await expect(
        updateSkillByName(
          "user_123",
          "skill_1",
          SkillName.Awards,
          [],
        ),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "NOT_FOUND",
        message: "Skills not found",
      });
    });

    it("updates and returns the selected skill field", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        new Types.ObjectId("64b64b64b64b64b64b64b64b"),
      );
      const selectMock = jest.fn().mockResolvedValue({ personalSkills: ["teamwork"] });
      (Skills.findOneAndUpdate as jest.Mock).mockReturnValue({ select: selectMock });

      const result = await updateSkillByName(
        "user_123",
        "skill_1",
        SkillName.PersonalSkills,
        ["teamwork"],
      );

      expect(Skills.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: "skill_1",
          user: expect.any(Types.ObjectId),
        },
        {
          $set: {
            personalSkills: ["teamwork"],
          },
        },
        {
          new: true,
          runValidators: true,
        },
      );
      expect(selectMock).toHaveBeenCalledWith(SkillName.PersonalSkills);
      expect(result).toEqual({ personalSkills: ["teamwork"] });
    });
  });
});
