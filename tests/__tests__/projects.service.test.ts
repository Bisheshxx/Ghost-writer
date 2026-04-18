import { Project } from "../../src/models/projects.model";
import * as UserService from "../../src/services/user.service";
import {
  createProjectService,
  deleteProjectService,
  getProjectService,
  updateProjectService,
} from "../../src/services/projects.service";
import { ApiError } from "../../src/utils/apiError";

jest.mock("../../src/models/projects.model", () => ({
  Project: {
    insertMany: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock("../../src/services/user.service", () => ({
  resolveUserIdByClerkId: jest.fn(),
}));

describe("ProjectsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createProjectService", () => {
    it("throws 400 when projects array is empty", async () => {
      await expect(createProjectService("user_123", [])).rejects.toMatchObject({
        statusCode: 400,
        code: "BAD_REQUEST",
      });
    });

    it("creates projects for resolved user", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        "mongo_user_1",
      );
      (Project.insertMany as jest.Mock).mockResolvedValue([{ _id: "proj_1" }]);

      const payload = [
        { projectTitle: "API", details: "REST", stack: ["Node"] },
      ];
      const result = await createProjectService("user_123", payload as any);

      expect(Project.insertMany).toHaveBeenCalledWith([
        { ...payload[0], user: "mongo_user_1" },
      ]);
      expect(result).toEqual([{ _id: "proj_1" }]);
    });
  });

  describe("getProjectService", () => {
    it("returns user projects", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        "mongo_user_1",
      );
      (Project.find as jest.Mock).mockResolvedValue([{ _id: "proj_1" }]);

      const result = await getProjectService("user_123");

      expect(Project.find).toHaveBeenCalledWith({ user: "mongo_user_1" });
      expect(result).toEqual([{ _id: "proj_1" }]);
    });
  });

  describe("deleteProjectService", () => {
    it("throws 404 when project does not exist", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        "mongo_user_1",
      );
      (Project.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        deleteProjectService("user_123", "proj_1"),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "NOT_FOUND",
      });
    });

    it("deletes matching project", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        "mongo_user_1",
      );
      const deleteOneMock = jest.fn().mockResolvedValue({ deletedCount: 1 });
      (Project.findOne as jest.Mock).mockResolvedValue({
        deleteOne: deleteOneMock,
      });

      const result = await deleteProjectService("user_123", "proj_1");

      expect(Project.findOne).toHaveBeenCalledWith({
        _id: "proj_1",
        user: "mongo_user_1",
      });
      expect(deleteOneMock).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("updateProjectService", () => {
    it("throws 400 when update payload has no valid fields", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        "mongo_user_1",
      );

      await expect(
        updateProjectService("user_123", "proj_1", {} as any),
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "BAD_REQUEST",
      });
    });

    it("throws 404 when project is missing", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        "mongo_user_1",
      );
      (Project.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        updateProjectService("user_123", "proj_1", {
          details: "updated",
        } as any),
      ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
    });

    it("updates and returns project", async () => {
      (UserService.resolveUserIdByClerkId as jest.Mock).mockResolvedValue(
        "mongo_user_1",
      );
      const setMock = jest.fn();
      const saveMock = jest
        .fn()
        .mockResolvedValue({ _id: "proj_1", details: "updated" });
      (Project.findOne as jest.Mock).mockResolvedValue({
        set: setMock,
        save: saveMock,
      });

      const result = await updateProjectService("user_123", "proj_1", {
        details: "updated",
      } as any);

      expect(Project.findOne).toHaveBeenCalledWith({
        _id: "proj_1",
        user: "mongo_user_1",
      });
      expect(setMock).toHaveBeenCalledWith({ details: "updated" });
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual({ _id: "proj_1", details: "updated" });
    });
  });
});
