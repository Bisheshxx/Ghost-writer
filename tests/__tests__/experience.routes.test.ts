import request from "supertest";
import app from "../../src/app";
import * as ExperienceService from "../../src/services/experience.service";
import { getAuth } from "@clerk/express";
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

jest.mock("../../src/services/experience.service");

describe("Experience Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/experience", () => {
    it("returns 401 when user is not authenticated", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: null });

      const response = await request(app)
        .post("/api/v1/experience")
        .set("Content-Type", "application/json")
        .send({
          experiences: [
            {
              companyName: "Acme Corp",
              jobTitle: "Backend Engineer",
              Descriptions: "Built APIs",
              startDate: "2024-01",
              isCurrent: true,
              endDate: null,
            },
          ],
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
      expect(ExperienceService.handleExperienceCreated).not.toHaveBeenCalled();
    });

    it("returns 400 when experiences array is missing", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });

      const response = await request(app)
        .post("/api/v1/experience")
        .set("Content-Type", "application/json")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("BAD_REQUEST");
      expect(ExperienceService.handleExperienceCreated).not.toHaveBeenCalled();
    });

    it("returns 400 when date format is invalid", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });

      const response = await request(app)
        .post("/api/v1/experience")
        .set("Content-Type", "application/json")
        .send({
          experiences: [
            {
              companyName: "Acme Corp",
              jobTitle: "Backend Engineer",
              Descriptions: "Built APIs",
              startDate: "2024/01",
              isCurrent: false,
              endDate: "2025-01",
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("BAD_REQUEST");
      expect(response.body.error.message).toContain("YYYY-MM");
      expect(ExperienceService.handleExperienceCreated).not.toHaveBeenCalled();
    });

    it("returns 400 when endDate is provided for current job", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });

      const response = await request(app)
        .post("/api/v1/experience")
        .set("Content-Type", "application/json")
        .send({
          experiences: [
            {
              companyName: "Acme Corp",
              jobTitle: "Backend Engineer",
              Descriptions: "Built APIs",
              startDate: "2024-01",
              isCurrent: true,
              endDate: "2025-01",
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("BAD_REQUEST");
      expect(response.body.error.message).toBe(
        "endDate must be null when isCurrent is true",
      );
      expect(ExperienceService.handleExperienceCreated).not.toHaveBeenCalled();
    });

    it("creates experiences successfully for valid request", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });

      const createdExperiences = [
        {
          _id: "exp_1",
          companyName: "Acme Corp",
          jobTitle: "Backend Engineer",
          Descriptions: "Built APIs",
          startDate: "2024-01",
          isCurrent: true,
          endDate: null,
          relavantDetails: "Node.js",
        },
      ];

      (
        ExperienceService.handleExperienceCreated as jest.Mock
      ).mockResolvedValue(createdExperiences);

      const payload = {
        experiences: [
          {
            companyName: "Acme Corp",
            jobTitle: "Backend Engineer",
            Descriptions: "Built APIs",
            startDate: "2024-01",
            isCurrent: true,
            endDate: null,
            relavantDetails: "Node.js",
          },
        ],
      };

      const response = await request(app)
        .post("/api/v1/experience")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(createdExperiences);
      expect(ExperienceService.handleExperienceCreated).toHaveBeenCalledWith(
        "user_123",
        payload.experiences,
      );
    });

    it("propagates service ApiError to global handler", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (
        ExperienceService.handleExperienceCreated as jest.Mock
      ).mockRejectedValue(new ApiError(404, "User not found", "NOT_FOUND"));

      const response = await request(app)
        .post("/api/v1/experience")
        .set("Content-Type", "application/json")
        .send({
          experiences: [
            {
              companyName: "Acme Corp",
              jobTitle: "Backend Engineer",
              Descriptions: "Built APIs",
              startDate: "2024-01",
              isCurrent: true,
              endDate: null,
            },
          ],
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("NOT_FOUND");
      expect(response.body.error.message).toBe("User not found");
    });
  });
});
