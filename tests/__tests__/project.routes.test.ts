import request from "supertest";
import app from "../../src/app";
import { getAuth } from "@clerk/express";
import * as ProjectService from "../../src/services/projects.service";
import { ApiError } from "../../src/utils/apiError";

jest.mock("@clerk/express", () => ({
  clerkMiddleware:
    () => (_req: unknown, _res: unknown, next: (err?: unknown) => void) =>
      next(),
  getAuth: jest.fn(),
  clerkClient: {
    sessions: {
      createSession: jest.fn(),
      getToken: jest.fn(),
    },
  },
}));

jest.mock("../../src/services/projects.service");

describe("Project Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/project", () => {
    it("returns 401 when unauthenticated", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: null });

      const response = await request(app)
        .post("/api/v1/project")
        .send({
          project: [{ projectTitle: "API", stack: ["Node"] }],
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });

    it("returns 400 when project payload missing", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      const response = await request(app).post("/api/v1/project").send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("BAD_REQUEST");
      expect(ProjectService.createProjectService).not.toHaveBeenCalled();
    });

    it("creates project successfully", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (ProjectService.createProjectService as jest.Mock).mockResolvedValue([
        { _id: "proj_1" },
      ]);

      const payload = {
        project: [
          {
            projectTitle: "API",
            details: "REST backend",
            stack: ["Node", "MongoDB"],
          },
        ],
      };

      const response = await request(app).post("/api/v1/project").send(payload);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([{ _id: "proj_1" }]);
      expect(ProjectService.createProjectService).toHaveBeenCalledWith(
        "user_123",
        payload.project,
      );
    });
  });

  describe("GET /api/v1/project", () => {
    it("returns projects for authenticated user", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (ProjectService.getProjectService as jest.Mock).mockResolvedValue([
        { _id: "proj_1" },
      ]);

      const response = await request(app).get("/api/v1/project");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([{ _id: "proj_1" }]);
    });
  });

  describe("PATCH /api/v1/project/:projectId", () => {
    it("returns 400 when payload missing", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      const response = await request(app)
        .patch("/api/v1/project/proj_1")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("BAD_REQUEST");
      expect(ProjectService.updateProjectService).not.toHaveBeenCalled();
    });

    it("updates project successfully", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (ProjectService.updateProjectService as jest.Mock).mockResolvedValue({
        _id: "proj_1",
        details: "new",
      });

      const payload = { project: { details: "new" } };
      const response = await request(app)
        .patch("/api/v1/project/proj_1")
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({ _id: "proj_1", details: "new" });
      expect(ProjectService.updateProjectService).toHaveBeenCalledWith(
        "user_123",
        "proj_1",
        payload.project,
      );
    });
  });

  describe("DELETE /api/v1/project/:projectId", () => {
    it("returns 204 when delete succeeds", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (ProjectService.deleteProjectService as jest.Mock).mockResolvedValue(
        null,
      );

      const response = await request(app).delete("/api/v1/project/proj_1");

      expect(response.status).toBe(204);
      expect(ProjectService.deleteProjectService).toHaveBeenCalledWith(
        "user_123",
        "proj_1",
      );
    });

    it("propagates service errors", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (ProjectService.deleteProjectService as jest.Mock).mockRejectedValue(
        new ApiError(404, "Project not found", "NOT_FOUND"),
      );

      const response = await request(app).delete("/api/v1/project/proj_1");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });
  });
});
