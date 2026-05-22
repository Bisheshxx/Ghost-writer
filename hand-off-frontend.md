# Job Tracker Backend API Spec

## Summary

Create a backend handoff doc for the job tracker feature that defines the endpoints needed by the current UI. Use a single jobs API as the main
resource, with generation actions layered on top of it. This keeps the table, Kanban board, and action buttons on one consistent contract.

## API Contract

Required endpoints under v1/jobs:

- GET /v1/jobs
  - Supports page, limit, search, and status
  - Returns paginated data plus meta for table and Kanban counts
- POST /v1/jobs
  - Creates a new job row
  - Defaults status to Empty if not provided
- GET /v1/jobs/:id
  - Returns one job record for future detail/edit flows
- PATCH /v1/jobs/:id
  - Updates job fields like company, title, description, location, link
- PATCH /v1/jobs/:id/status
  - Updates only the status
  - Used by table select changes and Kanban drag-and-drop
- DELETE /v1/jobs/:id
  - Deletes a job
- POST /v1/jobs/bulk-generate
  - Accepts multiple selected job IDs
  - Used by the bulk generation action

Response shape for list endpoints:

type PaginatedJobsResponse = {
data: Job[];
meta: {
page: number;
limit: number;
total: number;
totalPages: number;
hasNextPage: boolean;
};
};

Shared job shape:

type Job = {
id: string;
company: string;
title: string;
description: string;
location: string;
status: "Empty" | "Generated" | "Applied" | "Accepted" | "Rejected" | "Interview stage";
link: string;
};

## Generation Behavior

The job tracker UI also needs generation endpoints for the row actions:

- POST /v1/jobs/:id/generate/resume
- POST /v1/jobs/:id/generate/cover-letter

These should return the generated artifact content or a stored artifact reference. The backend doc should specify one consistent response shape
for both so the frontend can wire the resume and cover letter icons the same way.

If the backend wants to persist generation history, add the artifact metadata to the job detail response or return a generation record payload
from these endpoints.

## Test Plan

The backend doc should require these scenarios to work:

- Create a job with company, title, description, location, and link
- Fetch jobs with pagination, search, and optional status filtering
- Update a single job field set
- Update only the status field
- Delete a job
- Generate resume and cover letter from a single job
- Bulk generate from selected jobs
- Confirm Kanban counts can be derived from paginated status-specific queries

## Assumptions

- The backend will use a single v1/jobs resource rather than separate job and generation services
- Pagination is page-based for v1
- Search should match the fields already shown in the UI: company, title, description, and location
- The frontend will consume this spec through a feature service layer in features/job-tracker/service/
- If the backend later wants async generation, that can be added as a follow-up contract, but v1 should stay synchronous and simple
