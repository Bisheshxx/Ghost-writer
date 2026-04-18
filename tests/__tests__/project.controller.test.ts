import { getAuth } from "@clerk/express";
import {
  createProjectController,
  deleteProjectController,
  getProjectController,
  updateProjectController,
} from "../../src/controllers/project/project.controller";
import * as ProjectService from "../../src/services/projects.service";
import { sendSuccessResponse } from "../../src/utils/responseFormatter";

jest.mock("@clerk/express", () => ({
  getAuth: jest.fn(),
}));

jest.mock("../../src/services/projects.service", () => ({
  createProjectService: jest.fn(),
  getProjectService: jest.fn(),
  deleteProjectService: jest.fn(),
  updateProjectService: jest.fn(),
}));

jest.mock("../../src/utils/responseFormatter", () => ({
  sendSuccessResponse: jest.fn(),
}));

describe("Project controllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("createProjectController returns 401 when unauthenticated", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: null });
    const req = { body: { project: [] } } as any;
    const res = {} as any;
    const next = jest.fn();

    await createProjectController(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, code: "UNAUTHORIZED" }),
    );
  });

  it("createProjectController calls service and sends response", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
    (ProjectService.createProjectService as jest.Mock).mockResolvedValue([
      { _id: "proj_1" },
    ]);
    const req = {
      body: { project: [{ projectTitle: "API", stack: ["Node"] }] },
    } as any;
    const res = {} as any;
    const next = jest.fn();

    await createProjectController(req, res, next);

    expect(ProjectService.createProjectService).toHaveBeenCalledWith(
      "user_123",
      req.body.project,
    );
    expect(sendSuccessResponse).toHaveBeenCalledWith(res, 200, [
      { _id: "proj_1" },
    ]);
    expect(next).not.toHaveBeenCalled();
  });

  it("getProjectController returns data", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
    (ProjectService.getProjectService as jest.Mock).mockResolvedValue([
      { _id: "proj_1" },
    ]);
    const req = {} as any;
    const res = {} as any;
    const next = jest.fn();

    await getProjectController(req, res, next);

    expect(ProjectService.getProjectService).toHaveBeenCalledWith("user_123");
    expect(sendSuccessResponse).toHaveBeenCalledWith(res, 200, [
      { _id: "proj_1" },
    ]);
  });

  it("updateProjectController calls service with req.body.project", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
    (ProjectService.updateProjectService as jest.Mock).mockResolvedValue({
      _id: "proj_1",
    });
    const req = {
      params: { projectId: "proj_1" },
      body: { project: { details: "new" } },
    } as any;
    const res = {} as any;
    const next = jest.fn();

    await updateProjectController(req, res, next);

    expect(ProjectService.updateProjectService).toHaveBeenCalledWith(
      "user_123",
      "proj_1",
      req.body.project,
    );
    expect(sendSuccessResponse).toHaveBeenCalledWith(res, 200, {
      _id: "proj_1",
    });
  });

  it("deleteProjectController calls delete service", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
    (ProjectService.deleteProjectService as jest.Mock).mockResolvedValue(null);
    const req = { params: { projectId: "proj_1" } } as any;
    const res = {} as any;
    const next = jest.fn();

    await deleteProjectController(req, res, next);

    expect(ProjectService.deleteProjectService).toHaveBeenCalledWith(
      "user_123",
      "proj_1",
    );
    expect(sendSuccessResponse).toHaveBeenCalledWith(res, 204, null);
  });
});
