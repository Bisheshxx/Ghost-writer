import request from "supertest";
import app from "../../src/app";
import { getAuth } from "@clerk/express";
import * as QualificationService from "../../src/services/qualification.service";
import { ApiError } from "../../src/utils/apiError";

jest.mock("../../src/middleware/validate", () => {
  const actualValidate = jest.requireActual("../../src/middleware/validate");
  const { UpdateQualificationSchema } = jest.requireActual(
    "../../src/validation/qualification.validate",
  );

  return {
    ...actualValidate,
    validateBody: (schema: unknown) => {
      if (schema === UpdateQualificationSchema) {
        return (_req: unknown, _res: unknown, next: (err?: unknown) => void) =>
          next();
      }

      return actualValidate.validateBody(schema);
    },
  };
});

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

jest.mock("../../src/services/qualification.service");

describe("Qualification Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/qualification", () => {
    it("returns 401 when user is not authenticated", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: null });

      const response = await request(app)
        .post("/api/v1/qualification")
        .send({
          qualification: [
            {
              qualification: "BSc Computer Science",
              descriptions: "Studied software engineering",
              startDate: "2020-09",
              isCurrent: false,
              endDate: "2024-06",
              instituteName: "Example University",
              relavantDetails: "GPA 4.0",
            },
          ],
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
      expect(
        QualificationService.createQualificationService,
      ).not.toHaveBeenCalled();
    });

    it("returns 400 when qualification payload is missing", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });

      const response = await request(app)
        .post("/api/v1/qualification")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("BAD_REQUEST");
      expect(
        QualificationService.createQualificationService,
      ).not.toHaveBeenCalled();
    });

    it("creates qualifications successfully", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (
        QualificationService.createQualificationService as jest.Mock
      ).mockResolvedValue([{ _id: "qual_1" }]);

      const payload = {
        qualification: [
          {
            qualification: "BSc Computer Science",
            descriptions: "Studied software engineering",
            startDate: "2020-09",
            isCurrent: false,
            endDate: "2024-06",
            instituteName: "Example University",
            relavantDetails: "GPA 4.0",
          },
        ],
      };

      const response = await request(app)
        .post("/api/v1/qualification")
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([{ _id: "qual_1" }]);
      expect(
        QualificationService.createQualificationService,
      ).toHaveBeenCalledWith("user_123", payload.qualification);
    });
  });

  describe("GET /api/v1/qualification", () => {
    it("returns qualifications for authenticated user", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (
        QualificationService.getQualificationsService as jest.Mock
      ).mockResolvedValue([{ _id: "qual_1" }]);

      const response = await request(app).get("/api/v1/qualification");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([{ _id: "qual_1" }]);
      expect(
        QualificationService.getQualificationsService,
      ).toHaveBeenCalledWith("user_123");
    });
  });

  describe("PATCH /api/v1/qualification/:qualificationId", () => {
    it("updates qualification successfully", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (
        QualificationService.updateQualificationService as jest.Mock
      ).mockResolvedValue({
        _id: "qual_1",
        instituteName: "Updated University",
      });

      const payload = {
        qualification: {
          instituteName: "Updated University",
        },
      };

      const response = await request(app)
        .patch("/api/v1/qualification/qual_1")
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        _id: "qual_1",
        instituteName: "Updated University",
      });
      expect(
        QualificationService.updateQualificationService,
      ).toHaveBeenCalledWith("user_123", "qual_1", payload.qualification);
    });
  });

  describe("DELETE /api/v1/qualification/:qualificationId", () => {
    it("deletes qualification successfully", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (
        QualificationService.deleteQualificationService as jest.Mock
      ).mockResolvedValue(null);

      const response = await request(app).delete(
        "/api/v1/qualification/qual_1",
      );

      expect(response.status).toBe(204);
      expect(response.text).toBe("");
      expect(
        QualificationService.deleteQualificationService,
      ).toHaveBeenCalledWith("user_123", "qual_1");
    });

    it("propagates service errors", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (
        QualificationService.deleteQualificationService as jest.Mock
      ).mockRejectedValue(
        new ApiError(404, "Qualification not found", "NOT_FOUND"),
      );

      const response = await request(app).delete(
        "/api/v1/qualification/qual_1",
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("NOT_FOUND");
      expect(response.body.error.message).toBe("Qualification not found");
    });
  });
});
