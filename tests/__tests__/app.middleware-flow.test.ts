import request from "supertest";

jest.mock("@clerk/express", () => ({
  clerkMiddleware:
    () => (_req: unknown, _res: unknown, next: (err?: unknown) => void) =>
      next(),
}));

import app from "../../src/app";
import {
  ERROR_CODE_ROUTE_NOT_FOUND,
  ROUTE_DOES_NOT_EXIST,
} from "../../src/constants/server.messages";

describe("App middleware flow", () => {
  it("returns standardized 404 via middleware chain for unknown routes", async () => {
    const response = await request(app).get("/api/v1/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        error: {
          message: ROUTE_DOES_NOT_EXIST,
          code: ERROR_CODE_ROUTE_NOT_FOUND,
        },
      }),
    );
    expect(response.body.timestamp).toEqual(expect.any(String));
  });
});
