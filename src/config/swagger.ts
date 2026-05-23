import swaggerJSDoc from "swagger-jsdoc";

const apiEnvelope = (
  schema: Record<string, unknown>,
  metaSchema?: Record<string, unknown>,
) => ({
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    data: schema,
    ...(metaSchema ? { meta: metaSchema } : {}),
    timestamp: {
      type: "string",
      format: "date-time",
      example: "2026-05-23T00:00:00.000Z",
    },
  },
});

const errorEnvelope = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    error: {
      type: "object",
      properties: {
        message: { type: "string" },
        code: { type: "string" },
      },
    },
    timestamp: { type: "string", format: "date-time" },
  },
};

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ghost API",
      version: "1.0.0",
      description:
        "TypeScript Express API for resume, cover letter, profile, and job tracker workflows.",
    },
    servers: [
      {
        url: "/",
        description: "Current server",
      },
    ],
    tags: [
      { name: "Health" },
      { name: "Jobs" },
      { name: "Cover Letter" },
      { name: "Experience" },
      { name: "Projects" },
      { name: "Qualifications" },
      { name: "Skills" },
      { name: "Webhooks" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Clerk bearer token",
        },
      },
      schemas: {
        ErrorResponse: errorEnvelope,
        JobStatus: {
          type: "string",
          enum: [
            "Empty",
            "Generated",
            "Applied",
            "Accepted",
            "Rejected",
            "Interview stage",
          ],
        },
        Job: {
          type: "object",
          properties: {
            id: { type: "string", example: "65f000000000000000000001" },
            company: { type: "string", example: "Acme" },
            title: { type: "string", example: "Backend Engineer" },
            description: { type: "string", example: "Build APIs" },
            location: { type: "string", example: "Remote" },
            link: {
              type: "string",
              example: "https://example.com/jobs/backend-engineer",
            },
            status: { $ref: "#/components/schemas/JobStatus" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        JobInput: {
          type: "object",
          required: ["company", "title", "description", "location", "link"],
          properties: {
            company: { type: "string", example: "Acme" },
            title: { type: "string", example: "Backend Engineer" },
            description: { type: "string", example: "Build APIs" },
            location: { type: "string", example: "Remote" },
            link: {
              type: "string",
              example: "https://example.com/jobs/backend-engineer",
            },
            status: { $ref: "#/components/schemas/JobStatus" },
          },
        },
        JobGeneratedContent: {
          type: "object",
          properties: {
            jobId: { type: "string" },
            resumeText: { type: "string" },
            coverLetterText: { type: "string" },
            model: { type: "string", example: "llama-3.1-8b-instant" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ExperienceInput: {
          type: "object",
          required: [
            "companyName",
            "jobTitle",
            "Descriptions",
            "startDate",
            "isCurrent",
          ],
          properties: {
            companyName: { type: "string", example: "Acme" },
            jobTitle: { type: "string", example: "Backend Engineer" },
            Descriptions: { type: "string", example: "Built APIs" },
            startDate: { type: "string", example: "2024-01" },
            isCurrent: { type: "boolean", example: true },
            endDate: { type: "string", nullable: true, example: null },
            relavantDetails: {
              type: "string",
              nullable: true,
              example: "Promoted within first year",
            },
          },
        },
        ProjectInput: {
          type: "object",
          required: ["projectTitle", "stack"],
          properties: {
            projectTitle: { type: "string", example: "Resume Builder" },
            details: { type: "string", example: "Built a resume editor" },
            stack: {
              type: "array",
              items: { type: "string" },
              example: ["Node", "React"],
            },
          },
        },
        QualificationInput: {
          type: "object",
          required: [
            "qualification",
            "descriptions",
            "startDate",
            "isCurrent",
            "instituteName",
          ],
          properties: {
            qualification: { type: "string", example: "BSc Computer Science" },
            descriptions: { type: "string", example: "Software engineering" },
            startDate: { type: "string", example: "2020-09" },
            isCurrent: { type: "boolean", example: false },
            endDate: { type: "string", nullable: true, example: "2024-06" },
            instituteName: { type: "string", example: "Example University" },
            relavantDetails: { type: "string", nullable: true },
          },
        },
        CoverLetterInput: {
          type: "object",
          required: ["jobDescription"],
          properties: {
            jobDescription: {
              type: "string",
              example: "Software Engineer role at Acme.",
            },
          },
        },
        SkillsInput: {
          type: "object",
          properties: {
            technicalSkills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string", example: "Frontend" },
                  technologies: {
                    type: "array",
                    items: { type: "string" },
                    example: ["React", "TypeScript"],
                  },
                },
              },
            },
            personalSkills: {
              type: "array",
              items: { type: "string" },
              example: ["communication"],
            },
            awards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  details: { type: "string" },
                  issuedDate: { type: "string", format: "date" },
                  issuer: { type: "string" },
                },
              },
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: "Bad request",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        Unauthorized: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        NotFound: {
          description: "Not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            200: {
              description: "Service is active",
              content: {
                "application/json": {
                  schema: apiEnvelope({
                    type: "object",
                    properties: {
                      status: { type: "string", example: "active" },
                      version: { type: "string", example: "1.0.0-ts" },
                      message: { type: "string" },
                    },
                  }),
                },
              },
            },
          },
        },
      },
      "/api/v1/jobs": {
        get: {
          tags: ["Jobs"],
          summary: "List authenticated user's jobs",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 10 },
            },
            { name: "search", in: "query", schema: { type: "string" } },
            {
              name: "status",
              in: "query",
              schema: { $ref: "#/components/schemas/JobStatus" },
            },
          ],
          responses: {
            200: {
              description: "Paginated jobs",
              content: {
                "application/json": {
                  schema: apiEnvelope(
                    {
                      type: "array",
                      items: { $ref: "#/components/schemas/Job" },
                    },
                    {
                      type: "object",
                      properties: {
                        page: { type: "integer" },
                        limit: { type: "integer" },
                        total: { type: "integer" },
                        totalPages: { type: "integer" },
                        hasNextPage: { type: "boolean" },
                      },
                    },
                  ),
                },
              },
            },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
        post: {
          tags: ["Jobs"],
          summary: "Create a job",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/JobInput" },
              },
            },
          },
          responses: {
            201: {
              description: "Created job",
              content: {
                "application/json": {
                  schema: apiEnvelope({ $ref: "#/components/schemas/Job" }),
                },
              },
            },
            400: { $ref: "#/components/responses/BadRequest" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/api/v1/jobs/{id}": {
        get: {
          tags: ["Jobs"],
          summary: "Get one owned job",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "Job",
              content: {
                "application/json": {
                  schema: apiEnvelope({ $ref: "#/components/schemas/Job" }),
                },
              },
            },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
        patch: {
          tags: ["Jobs"],
          summary: "Update a job",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/JobInput" },
              },
            },
          },
          responses: {
            200: {
              description: "Updated job",
              content: {
                "application/json": {
                  schema: apiEnvelope({ $ref: "#/components/schemas/Job" }),
                },
              },
            },
            400: { $ref: "#/components/responses/BadRequest" },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
        delete: {
          tags: ["Jobs"],
          summary: "Delete a job",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            204: { description: "Deleted" },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
      },
      "/api/v1/jobs/{id}/status": {
        patch: {
          tags: ["Jobs"],
          summary: "Update job status",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: { $ref: "#/components/schemas/JobStatus" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Updated job",
              content: {
                "application/json": {
                  schema: apiEnvelope({ $ref: "#/components/schemas/Job" }),
                },
              },
            },
          },
        },
      },
      "/api/v1/jobs/{id}/generate": {
        post: {
          tags: ["Jobs"],
          summary: "Generate resume and cover letter text for a job",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "Generated resume and cover letter text",
              content: {
                "application/json": {
                  schema: apiEnvelope({
                    $ref: "#/components/schemas/JobGeneratedContent",
                  }),
                },
              },
            },
            401: { $ref: "#/components/responses/Unauthorized" },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
      },
      "/api/v1/generate-cover-letter": {
        post: {
          tags: ["Cover Letter"],
          summary: "Generate a cover letter",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CoverLetterInput" },
              },
            },
          },
          responses: {
            200: {
              description: "Generated cover letter",
              content: {
                "application/json": {
                  schema: apiEnvelope({ type: "object" }),
                },
              },
            },
          },
        },
      },
      "/api/v1/experience": {
        get: {
          tags: ["Experience"],
          summary: "List experiences",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Experiences" } },
        },
        post: {
          tags: ["Experience"],
          summary: "Create experiences",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["experiences"],
                  properties: {
                    experiences: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ExperienceInput" },
                    },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Created experiences" } },
        },
      },
      "/api/v1/experience/{experienceId}": {
        patch: {
          tags: ["Experience"],
          summary: "Update an experience",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "experienceId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 200: { description: "Updated experience" } },
        },
        delete: {
          tags: ["Experience"],
          summary: "Delete an experience",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "experienceId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 204: { description: "Deleted" } },
        },
      },
      "/api/v1/project": {
        get: {
          tags: ["Projects"],
          summary: "List projects",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Projects" } },
        },
        post: {
          tags: ["Projects"],
          summary: "Create projects",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["project"],
                  properties: {
                    project: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ProjectInput" },
                    },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Created projects" } },
        },
      },
      "/api/v1/project/{projectId}": {
        patch: {
          tags: ["Projects"],
          summary: "Update a project",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "projectId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 200: { description: "Updated project" } },
        },
        delete: {
          tags: ["Projects"],
          summary: "Delete a project",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "projectId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 204: { description: "Deleted" } },
        },
      },
      "/api/v1/qualification": {
        get: {
          tags: ["Qualifications"],
          summary: "List qualifications",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Qualifications" } },
        },
        post: {
          tags: ["Qualifications"],
          summary: "Create qualifications",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["qualifications"],
                  properties: {
                    qualifications: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/QualificationInput",
                      },
                    },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Created qualifications" } },
        },
      },
      "/api/v1/qualification/{qualificationId}": {
        patch: {
          tags: ["Qualifications"],
          summary: "Update a qualification",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "qualificationId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 200: { description: "Updated qualification" } },
        },
        delete: {
          tags: ["Qualifications"],
          summary: "Delete a qualification",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "qualificationId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 204: { description: "Deleted" } },
        },
      },
      "/api/v1/skills": {
        get: {
          tags: ["Skills"],
          summary: "List skills",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Skills" } },
        },
        post: {
          tags: ["Skills"],
          summary: "Create skills",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["skills"],
                  properties: {
                    skills: { $ref: "#/components/schemas/SkillsInput" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Created skills" } },
        },
      },
      "/api/v1/webhooks": {
        post: {
          tags: ["Webhooks"],
          summary: "Clerk webhook receiver",
          responses: {
            200: { description: "Webhook processed" },
            201: { description: "Webhook processed and resource created" },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);
