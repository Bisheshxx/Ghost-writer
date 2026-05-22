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
  it("serves the OpenAPI JSON document", async () => {
    const response = await request(app).get("/api-docs.json");

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.0.0");
    expect(response.body.info.title).toBe("Ghost API");
    expect(response.body.paths["/api/v1/jobs"]).toBeDefined();
  });

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
