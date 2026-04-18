import request from "supertest";
import app from "../../src/app";
import { getAuth } from "@clerk/express";
import * as SkillsService from "../../src/services/skills.service";
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

jest.mock("../../src/services/skills.service");

describe("Skills Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/skills", () => {
    it("returns 401 when user is not authenticated", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: null });

      const response = await request(app).post("/api/v1/skills").send({
        skills: {
          technicalSkills: [],
          personalSkills: [],
          awards: [],
        },
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
      expect(SkillsService.createSkillsService).not.toHaveBeenCalled();
    });

    it("returns 400 when payload is empty", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });

      const response = await request(app).post("/api/v1/skills").send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("BAD_REQUEST");
      expect(SkillsService.createSkillsService).not.toHaveBeenCalled();
    });

    it("creates skills successfully for valid payload", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (SkillsService.createSkillsService as jest.Mock).mockResolvedValue({ _id: "skill_1" });

      const payload = {
        skills: {
          technicalSkills: [
            {
              category: "Frontend",
              technologies: ["React", "TypeScript"],
            },
          ],
          personalSkills: ["communication"],
          awards: [
            {
              title: "Best Developer",
              details: "Awarded for outstanding performance",
              issuedDate: "2023-05-01",
              issuer: "Tech Company",
            },
          ],
        },
      };

      const response = await request(app)
        .post("/api/v1/skills")
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({ _id: "skill_1" });
      expect(SkillsService.createSkillsService).toHaveBeenCalledWith(
        "user_123",
        {
          technicalSkills: [
            {
              category: "Frontend",
              technologies: ["React", "TypeScript"],
            },
          ],
          personalSkills: ["communication"],
          awards: [
            {
              title: "Best Developer",
              details: "Awarded for outstanding performance",
              issuedDate: new Date("2023-05-01"),
              issuer: "Tech Company",
            },
          ],
        },
      );
    });
  });

  describe("GET /api/v1/skills", () => {
    it("returns skills for authenticated user", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (SkillsService.getSkillsService as jest.Mock).mockResolvedValue([{ _id: "skill_1" }]);

      const response = await request(app).get("/api/v1/skills");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([{ _id: "skill_1" }]);
      expect(SkillsService.getSkillsService).toHaveBeenCalledWith("user_123");
    });
  });

  describe("PUT /api/v1/skills/personalSkills/:skillId", () => {
    it("returns 400 when payload is empty", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });

      const response = await request(app)
        .put("/api/v1/skills/personalSkills/skill_1")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("BAD_REQUEST");
    });

    it("updates personal skills successfully", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (SkillsService.updateSkillByName as jest.Mock).mockResolvedValue({
        personalSkills: ["communication"],
      });

      const response = await request(app)
        .put("/api/v1/skills/personalSkills/skill_1")
        .send({ personalSkills: ["communication"] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({ personalSkills: ["communication"] });
      expect(SkillsService.updateSkillByName).toHaveBeenCalledWith(
        "user_123",
        "skill_1",
        "personalSkills",
        ["communication"],
      );
    });
  });

  describe("PUT /api/v1/skills/technicalSkills/:skillId", () => {
    it("updates technical skills successfully", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (SkillsService.updateSkillByName as jest.Mock).mockResolvedValue({
        technicalSkills: [
          { category: "Frontend", technologies: ["React"] },
        ],
      });

      const response = await request(app)
        .put("/api/v1/skills/technicalSkills/skill_1")
        .send({
          technicalSkills: [
            { category: "Frontend", technologies: ["React"] },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        technicalSkills: [
          { category: "Frontend", technologies: ["React"] },
        ],
      });
      expect(SkillsService.updateSkillByName).toHaveBeenCalledWith(
        "user_123",
        "skill_1",
        "technicalSkills",
        [{ category: "Frontend", technologies: ["React"] }],
      );
    });
  });

  describe("PUT /api/v1/skills/awards/:skillId", () => {
    it("updates awards successfully", async () => {
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

      const response = await request(app)
        .put("/api/v1/skills/awards/skill_1")
        .send({
          awards: [
            {
              title: "Best Developer",
              details: "Awarded for outstanding performance",
              issuedDate: "2023-05-01",
              issuer: "Tech Company",
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        awards: [
          {
            title: "Best Developer",
            details: "Awarded for outstanding performance",
            issuedDate: "2023-05-01",
            issuer: "Tech Company",
          },
        ],
      });
      expect(SkillsService.updateSkillByName).toHaveBeenCalledWith(
        "user_123",
        "skill_1",
        "awards",
        [
          {
            title: "Best Developer",
            details: "Awarded for outstanding performance",
            issuedDate: new Date("2023-05-01"),
            issuer: "Tech Company",
          },
        ],
      );
    });

    it("propagates service ApiError to global handler", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (SkillsService.updateSkillByName as jest.Mock).mockRejectedValue(
        new ApiError(404, "Skills not found", "NOT_FOUND"),
      );

      const response = await request(app)
        .put("/api/v1/skills/awards/skill_1")
        .send({
          awards: [
            {
              title: "Best Developer",
              details: "Awarded for outstanding performance",
              issuedDate: "2023-05-01",
              issuer: "Tech Company",
            },
          ],
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("NOT_FOUND");
      expect(response.body.error.message).toBe("Skills not found");
    });
  });
});
