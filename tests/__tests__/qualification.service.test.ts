import { Qualification } from "../../src/models/qualification.model";
import * as UserService from "../../src/services/user.service";
import {
  createQualificationService,
  deleteQualificationService,
  getQualificationsService,
  updateQualificationService,
} from "../../src/services/qualification.service";

jest.mock("../../src/models/qualification.model", () => ({
  Qualification: {
    insertMany: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock("../../src/services/user.service", () => ({
  resolveUserIdByClerkId: jest.fn(),
}));

describe("QualificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createQualificationService", () => {
    it("throws 400 when qualifications array is empty", async () => {
      await expect(
        createQualificationService("user_123", []),
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "BAD_REQUEST",
        message: "At least one qualification is required",
      });
    });

    it("creates qualifications for the resolved user", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        "mongo_user_1",
      );
      (Qualification.insertMany as jest.Mock).mockResolvedValue([
        { _id: "qual_1" },
      ]);

      const payload = [
        {
          qualification: "BSc Computer Science",
          descriptions: "Studied software engineering",
          startDate: "2020-09",
          isCurrent: false,
          endDate: "2024-06",
          instituteName: "Example University",
          relavantDetails: "GPA 4.0",
        },
      ];

      const result = await createQualificationService("user_123", payload);

      expect(UserService.resolveUserIdByClerkId).toHaveBeenCalledWith(
        "user_123",
      );
      expect(Qualification.insertMany).toHaveBeenCalledWith([
        { ...payload[0], user: "mongo_user_1" },
      ]);
      expect(result).toEqual([{ _id: "qual_1" }]);
    });
  });

  describe("getQualificationsService", () => {
    it("returns qualifications for the resolved user", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        "mongo_user_1",
      );
      (Qualification.find as jest.Mock).mockResolvedValue([{ _id: "qual_1" }]);

      const result = await getQualificationsService("user_123");

      expect(Qualification.find).toHaveBeenCalledWith({ user: "mongo_user_1" });
      expect(result).toEqual([{ _id: "qual_1" }]);
    });
  });

  describe("deleteQualificationService", () => {
    it("throws 404 when qualification does not exist", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        "mongo_user_1",
      );
      (Qualification.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        deleteQualificationService("user_123", "qual_1"),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "NOT_FOUND",
        message: "Qualification not found",
      });
    });

    it("deletes the matching qualification for the authenticated user", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        "mongo_user_1",
      );
      const deleteOneMock = jest.fn().mockResolvedValue({ deletedCount: 1 });
      (Qualification.findOne as jest.Mock).mockResolvedValue({
        deleteOne: deleteOneMock,
      });

      const result = await deleteQualificationService("user_123", "qual_1");

      expect(Qualification.findOne).toHaveBeenCalledWith({
        _id: "qual_1",
        user: "mongo_user_1",
      });
      expect(deleteOneMock).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("updateProjectService", () => {
    it("throws 400 when no valid fields are provided", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        "mongo_user_1",
      );

      await expect(
        updateQualificationService("user_123", "qual_1", {}),
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "BAD_REQUEST",
        message: "No valid fields provided for update",
      });
    });

    it("throws 404 when qualification is missing", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        "mongo_user_1",
      );
      (Qualification.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        updateQualificationService("user_123", "qual_1", {
          instituteName: "Updated Institute",
        }),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "NOT_FOUND",
        message: "Qualification not found",
      });
    });

    it("updates and returns the qualification", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        "mongo_user_1",
      );
      const setMock = jest.fn();
      const saveMock = jest
        .fn()
        .mockResolvedValue({ _id: "qual_1", instituteName: "Updated" });
      (Qualification.findOne as jest.Mock).mockResolvedValue({
        set: setMock,
        save: saveMock,
      });

      const result = await updateQualificationService("user_123", "qual_1", {
        instituteName: "Updated",
      });

      expect(Qualification.findOne).toHaveBeenCalledWith({
        _id: "qual_1",
        user: "mongo_user_1",
      });
      expect(setMock).toHaveBeenCalledWith({ instituteName: "Updated" });
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual({ _id: "qual_1", instituteName: "Updated" });
    });
  });
});
