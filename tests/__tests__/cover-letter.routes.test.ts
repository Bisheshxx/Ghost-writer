import request from "supertest";
import { CoverLetterSchema } from "../../src/validation/cover-lettter.validate";
import app from "../../src/app";
import { clerkClient, clerkMiddleware, getAuth } from "@clerk/express";
import * as CoverLetterService from "../../src/services/cover-lettter.service";

jest.mock("@clerk/express", () => ({
  clerkMiddleware:
    () => (_req: unknown, _res: unknown, next: (err?: unknown) => void) =>
      next(),
  getAuth: jest.fn(),
  clerkClient: {
    session: {
      createSession: jest.fn(),
      getToken: jest.fn(),
    },
  },
}));

jest.mock("../../src/services/cover-lettter.service");

const payload = {
  jobDescription: "Software Engineer.",
  userSource: {
    experienceIds: ["69e1ab977942b4e439eab6c3", "69e1ab977942b4e439eab6c4"],
    qualificationIds: ["69e63dcfb9ca89ce93da62ff"],
    projectId: ["69e36ae37531972342121699"],
    skillsId: "69e2dbe29c5ea5288d231dd9",
  },
};

describe("Cover Letter Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST api/v1/generate-cover-letter", () => {
    it("returns 401 when unauthenticated", async () => {
      (getAuth as jest.Mock).mockResolvedValue({ userId: null });
      const response = await request(app)
        .post("/api/v1/project")
        .send({ ...payload });
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });
  });

  it("returns ");
});
