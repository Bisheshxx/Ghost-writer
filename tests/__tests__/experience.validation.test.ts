import {
  addExperienceSchema,
  experienceItemSchema,
} from "../../src/validation/experience";

describe("Experience validation schema", () => {
  it("passes for valid current experience with null endDate", () => {
    const result = experienceItemSchema.safeParse({
      companyName: "Acme",
      jobTitle: "Backend Engineer",
      Descriptions: "Built APIs",
      startDate: "2024-01",
      isCurrent: true,
      endDate: null,
    });

    expect(result.success).toBe(true);
  });

  it("fails when endDate is before startDate", () => {
    const result = experienceItemSchema.safeParse({
      companyName: "Acme",
      jobTitle: "Backend Engineer",
      Descriptions: "Built APIs",
      startDate: "2024-06",
      isCurrent: false,
      endDate: "2024-01",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "endDate cannot be earlier than startDate",
      );
    }
  });

  it("fails when isCurrent is true and endDate is present", () => {
    const result = experienceItemSchema.safeParse({
      companyName: "Acme",
      jobTitle: "Backend Engineer",
      Descriptions: "Built APIs",
      startDate: "2024-01",
      isCurrent: true,
      endDate: "2025-01",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "endDate must be null when isCurrent is true",
      );
    }
  });

  it("fails when startDate format is invalid", () => {
    const result = experienceItemSchema.safeParse({
      companyName: "Acme",
      jobTitle: "Backend Engineer",
      Descriptions: "Built APIs",
      startDate: "2024/01",
      isCurrent: true,
      endDate: null,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("YYYY-MM");
    }
  });

  it("accepts body with multiple valid experiences", () => {
    const result = addExperienceSchema.safeParse({
      experiences: [
        {
          companyName: "Acme",
          jobTitle: "Backend Engineer",
          Descriptions: "Built APIs",
          startDate: "2024-01",
          isCurrent: true,
          endDate: null,
          relavantDetails: null,
        },
        {
          companyName: "Beta",
          jobTitle: "Intern",
          Descriptions: "Built tools",
          startDate: "2023-01",
          isCurrent: false,
          endDate: "2023-12",
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
