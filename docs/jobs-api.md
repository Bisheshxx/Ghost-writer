# Jobs API

## Summary

The jobs API powers the job tracker under `/api/v1/jobs`. Every endpoint requires Clerk authentication and scopes records to the authenticated user. Responses use the existing success envelope:

```ts
{
  success: true;
  data: unknown;
  timestamp: string;
}
```

## Job Shape

```ts
type JobStatus =
  | "Empty"
  | "Generated"
  | "Applied"
  | "Accepted"
  | "Rejected"
  | "Interview stage";

type Job = {
  id: string;
  company: string;
  title: string;
  description: string;
  location: string;
  link: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
};
```

## Endpoints

- `GET /api/v1/jobs`
  - Query: `page`, `limit`, `search`, `status`
  - Defaults: `page=1`, `limit=10`
  - Search matches `company`, `title`, `description`, and `location`
  - Returns `{ data: Job[], meta: { page, limit, total, totalPages, hasNextPage } }`
- `POST /api/v1/jobs`
  - Body: `{ company, title, description, location, link, status? }`
  - Defaults `status` to `"Empty"`
  - Returns `201 Created` with the created job
- `GET /api/v1/jobs/:id`
  - Returns one owned job or `404`
- `PATCH /api/v1/jobs/:id`
  - Body allows partial updates to `company`, `title`, `description`, `location`, `link`, and `status`
  - Empty update bodies are rejected
- `PATCH /api/v1/jobs/:id/status`
  - Body: `{ status }`
  - Updates only the Kanban/table status
- `DELETE /api/v1/jobs/:id`
  - Deletes one owned job
  - Returns `204 No Content`
- `POST /api/v1/jobs/:id/generate/resume`
  - Returns `{ jobId, type: "resume", content, createdAt }`
- `POST /api/v1/jobs/:id/generate/cover-letter`
  - Returns `{ jobId, type: "cover-letter", content, createdAt }`

## Deferred

`POST /api/v1/jobs/bulk-generate` is intentionally not implemented in this pass. Add it later once the bulk request and persistence contract is finalized.
