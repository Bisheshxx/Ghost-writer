import request from "supertest";
import app from "../../src/app";
import { getAuth } from "@clerk/express";
import * as JobsService from "../../src/services/jobs.service";
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

jest.mock("../../src/services/jobs.service");

const validJobPayload = {
  company: "Acme",
  title: "Backend Engineer",
  description: "Build APIs",
  location: "Remote",
  link: "https://example.com/jobs/1",
};

describe("Jobs Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ["get", "/api/v1/jobs"],
    ["post", "/api/v1/jobs"],
    ["get", "/api/v1/jobs/job_1"],
    ["patch", "/api/v1/jobs/job_1"],
    ["patch", "/api/v1/jobs/job_1/status"],
    ["delete", "/api/v1/jobs/job_1"],
    ["post", "/api/v1/jobs/job_1/generate/resume"],
    ["post", "/api/v1/jobs/job_1/generate/cover-letter"],
  ])("requires auth for %s %s", async (method, path) => {
    (getAuth as jest.Mock).mockReturnValue({ userId: null });

    const response = await request(app)[method as "get"](path).send({});

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  describe("POST /api/v1/jobs", () => {
    it("creates a job with default Empty status", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (JobsService.createJobService as jest.Mock).mockResolvedValue({
        id: "job_1",
        ...validJobPayload,
        status: "Empty",
      });

      const response = await request(app)
        .post("/api/v1/jobs")
        .send(validJobPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        id: "job_1",
        ...validJobPayload,
        status: "Empty",
      });
      expect(JobsService.createJobService).toHaveBeenCalledWith("user_123", {
        ...validJobPayload,
        status: "Empty",
      });
    });

    it("rejects missing required fields", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });

      const response = await request(app).post("/api/v1/jobs").send({
        company: "Acme",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("BAD_REQUEST");
      expect(JobsService.createJobService).not.toHaveBeenCalled();
    });

    it("rejects invalid status", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });

      const response = await request(app)
        .post("/api/v1/jobs")
        .send({ ...validJobPayload, status: "Interested" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("BAD_REQUEST");
      expect(JobsService.createJobService).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/v1/jobs", () => {
    it("fetches paginated jobs with page, limit, search, and status", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (JobsService.listJobsService as jest.Mock).mockResolvedValue({
        data: [{ id: "job_1", ...validJobPayload, status: "Applied" }],
        meta: {
          page: 2,
          limit: 5,
          total: 6,
          totalPages: 2,
          hasNextPage: false,
        },
      });

      const response = await request(app)
        .get("/api/v1/jobs")
        .query({ page: "2", limit: "5", search: "api", status: "Applied" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.meta).toEqual({
        page: 2,
        limit: 5,
        total: 6,
        totalPages: 2,
        hasNextPage: false,
      });
      expect(JobsService.listJobsService).toHaveBeenCalledWith("user_123", {
        page: 2,
        limit: 5,
        search: "api",
        status: "Applied",
      });
    });

    it("defaults pagination and supports separate status-filtered Kanban queries", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (JobsService.listJobsService as jest.Mock).mockResolvedValue({
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
        },
      });

      const response = await request(app)
        .get("/api/v1/jobs")
        .query({ status: "Interview stage" });

      expect(response.status).toBe(200);
      expect(JobsService.listJobsService).toHaveBeenCalledWith("user_123", {
        page: 1,
        limit: 10,
        status: "Interview stage",
      });
    });
  });

  describe("GET /api/v1/jobs/:id", () => {
    it("fetches a single owned job", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (JobsService.getJobService as jest.Mock).mockResolvedValue({
        id: "job_1",
        ...validJobPayload,
        status: "Empty",
      });

      const response = await request(app).get("/api/v1/jobs/job_1");

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe("job_1");
      expect(JobsService.getJobService).toHaveBeenCalledWith(
        "user_123",
        "job_1",
      );
    });

    it("returns 404 for missing or non-owned jobs", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (JobsService.getJobService as jest.Mock).mockRejectedValue(
        new ApiError(404, "Job not found", "NOT_FOUND"),
      );

      const response = await request(app).get("/api/v1/jobs/job_404");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("PATCH /api/v1/jobs/:id", () => {
    it("rejects empty update bodies", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });

      const response = await request(app)
        .patch("/api/v1/jobs/job_1")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("BAD_REQUEST");
      expect(JobsService.updateJobService).not.toHaveBeenCalled();
    });

    it("updates partial job fields", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (JobsService.updateJobService as jest.Mock).mockResolvedValue({
        id: "job_1",
        ...validJobPayload,
        location: "Auckland",
        status: "Empty",
      });

      const response = await request(app)
        .patch("/api/v1/jobs/job_1")
        .send({ location: "Auckland" });

      expect(response.status).toBe(200);
      expect(response.body.data.location).toBe("Auckland");
      expect(JobsService.updateJobService).toHaveBeenCalledWith(
        "user_123",
        "job_1",
        { location: "Auckland" },
      );
    });
  });

  describe("PATCH /api/v1/jobs/:id/status", () => {
    it("updates only the status field", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (JobsService.updateJobStatusService as jest.Mock).mockResolvedValue({
        id: "job_1",
        ...validJobPayload,
        status: "Generated",
      });

      const response = await request(app)
        .patch("/api/v1/jobs/job_1/status")
        .send({ status: "Generated" });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe("Generated");
      expect(JobsService.updateJobStatusService).toHaveBeenCalledWith(
        "user_123",
        "job_1",
        "Generated",
      );
    });
  });

  describe("DELETE /api/v1/jobs/:id", () => {
    it("deletes an owned job", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (JobsService.deleteJobService as jest.Mock).mockResolvedValue(null);

      const response = await request(app).delete("/api/v1/jobs/job_1");

      expect(response.status).toBe(204);
      expect(JobsService.deleteJobService).toHaveBeenCalledWith(
        "user_123",
        "job_1",
      );
    });
  });

  describe("generation endpoints", () => {
    it.each([
      ["/api/v1/jobs/job_1/generate/resume", "resume"],
      ["/api/v1/jobs/job_1/generate/cover-letter", "cover-letter"],
    ])("returns generation response shape for %s", async (path, type) => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (JobsService.generateJobArtifactService as jest.Mock).mockResolvedValue({
        jobId: "job_1",
        type,
        content: "Generated content",
        createdAt: "2026-05-23T00:00:00.000Z",
      });

      const response = await request(app).post(path);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        jobId: "job_1",
        type,
        content: "Generated content",
        createdAt: "2026-05-23T00:00:00.000Z",
      });
      expect(JobsService.generateJobArtifactService).toHaveBeenCalledWith(
        "user_123",
        "job_1",
        type,
      );
    });
  });

  it("does not implement bulk generation yet", async () => {
    (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });

    const response = await request(app)
      .post("/api/v1/jobs/bulk-generate")
      .send({ jobIds: ["job_1"] });

    expect(response.status).toBe(404);
  });
});
