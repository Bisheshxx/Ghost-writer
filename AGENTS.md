# AGENTS.md

Guidance for coding agents working in this repository.

## Project Overview

Ghost is a TypeScript Express backend. The app uses MongoDB through Mongoose, Clerk for authentication, Zod for request validation, Jest and Supertest for tests, and pnpm for package management.

The HTTP app is configured in `src/app.ts`. The runtime entrypoint is `src/server.ts`, which loads environment variables, connects to MongoDB, and starts the server. The health check is `GET /health`. Swagger UI is available at `GET /api-docs`, and the raw OpenAPI JSON is available at `GET /api-docs.json`.

## Common Commands

- `pnpm install` - install dependencies.
- `pnpm run dev` - start the TypeScript dev server with auto-restart.
- `pnpm run build` - compile TypeScript with `tsc`.
- `pnpm test` - run Jest tests.
- `pnpm run test:coverage` - run Jest with coverage.
- `docker-compose up --build` - build and run the Docker Compose API service.

Docker Compose is defined in `docker-compose.yaml`. It maps host port `5001` to container port `6767` and loads environment variables from `src/config/.env`.

## Source Layout

Preserve the existing layered structure:

- `src/routes/` wires endpoints, authentication, validation, and async handlers.
- `src/controllers/` handles request/response flow and reads Clerk auth with `getAuth`.
- `src/services/` contains business logic and Mongoose access.
- `src/models/` defines Mongoose schemas.
- `src/validation/` defines Zod request schemas.
- `src/middleware/` contains Express middleware such as auth, validation, and the global error handler.
- `src/utils/responseFormatter.ts` centralizes API response shapes.
- `src/utils/apiError.ts` defines `ApiError`.
- `src/constants/server.messages.ts` centralizes reusable server messages and error codes.
- `src/config/swagger.ts` defines the OpenAPI spec served by Swagger UI.

## Implementation Patterns

- For authenticated endpoints, add `isAuthenticated` in the route and keep the controller-level missing `userId` guard where the current code does so.
- For request validation, use `validateBody(schema)` with Zod schemas from `src/validation/`.
- For async route handlers, wrap controllers with `asyncHandler` from `src/utils/express-async-errors.ts`.
- For controlled errors, throw or pass `ApiError` with an explicit HTTP status and error code.
- Keep error response formatting centralized through the global error handler in `src/middleware/Errorhandler.ts`.
- Prefer `src/constants/server.messages.ts` for user-facing messages and reusable error codes.
- Use `sendSuccessResponse` from `src/utils/responseFormatter.ts` for successful JSON responses.
- When adding, removing, or changing public endpoints, update `src/config/swagger.ts` in the same change so `/api-docs` stays accurate.
- Follow existing naming and casing in nearby files, even where legacy names contain typos, unless the task explicitly includes a rename.

## Testing Guidance

Add or update focused Jest tests under `tests/__tests__/` for new behavior. Existing tests commonly mock Clerk, service modules, Mongoose models, and use Supertest for route coverage.

Run the narrowest useful test first when changing behavior, then run broader checks when the change touches shared middleware, routing, auth, validation, or response formatting.
