import { getAuth } from "@clerk/express";
import {
  createQualificationController,
  deleteQualificationController,
  getQualificationController,
  updateQualificationController,
} from "../../src/controllers/qualification/qualification.controller";
import * as QualificationService from "../../src/services/qualification.service";
import { sendSuccessResponse } from "../../src/utils/responseFormatter";

jest.mock("@clerk/express", () => ({
  getAuth: jest.fn(),
}));

jest.mock("../../src/services/qualification.service", () => ({
  createQualificationService: jest.fn(),
  getQualificationsService: jest.fn(),
  deleteQualificationService: jest.fn(),
  updateQualificationService: jest.fn(),
}));

jest.mock("../../src/utils/responseFormatter", () => ({
  sendSuccessResponse: jest.fn(),
}));

describe("Qualification controllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createQualificationController", () => {
    it("returns 401 when unauthenticated", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: null });

      const req = { body: { qualification: [] } } as any;
      const res = {} as any;
      const next = jest.fn();

      await createQualificationController(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, code: "UNAUTHORIZED" }),
      );
      expect(
        QualificationService.createQualificationService,
      ).not.toHaveBeenCalled();
    });

    it("calls service and sends response", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (
        QualificationService.createQualificationService as jest.Mock
      ).mockResolvedValue([{ _id: "qual_1" }]);

      const req = {
        body: {
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
        },
      } as any;
      const res = {} as any;
      const next = jest.fn();

      await createQualificationController(req, res, next);

      expect(
        QualificationService.createQualificationService,
      ).toHaveBeenCalledWith("user_123", req.body.qualification);
      expect(sendSuccessResponse).toHaveBeenCalledWith(res, 200, [
        { _id: "qual_1" },
      ]);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("getQualificationController", () => {
    it("returns 401 when unauthenticated", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: null });

      const req = {} as any;
      const res = {} as any;
      const next = jest.fn();

      await getQualificationController(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, code: "UNAUTHORIZED" }),
      );
      expect(
        QualificationService.getQualificationsService,
      ).not.toHaveBeenCalled();
    });

    it("returns qualifications for authenticated user", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (
        QualificationService.getQualificationsService as jest.Mock
      ).mockResolvedValue([{ _id: "qual_1" }]);

      const req = {} as any;
      const res = {} as any;
      const next = jest.fn();

      await getQualificationController(req, res, next);

      expect(
        QualificationService.getQualificationsService,
      ).toHaveBeenCalledWith("user_123");
      expect(sendSuccessResponse).toHaveBeenCalledWith(res, 200, [
        { _id: "qual_1" },
      ]);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("updateQualificationController", () => {
    it("returns 401 when unauthenticated", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: null });

      const req = {
        params: { qualificationId: "qual_1" },
        body: { qualification: { instituteName: "Updated" } },
      } as any;
      const res = {} as any;
      const next = jest.fn();

      await updateQualificationController(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, code: "UNAUTHORIZED" }),
      );
      expect(
        QualificationService.updateQualificationService,
      ).not.toHaveBeenCalled();
    });

    it("updates qualification fields", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (
        QualificationService.updateQualificationService as jest.Mock
      ).mockResolvedValue({
        _id: "qual_1",
        instituteName: "Updated",
      });

      const req = {
        params: { qualificationId: "qual_1" },
        body: { qualification: { instituteName: "Updated" } },
      } as any;
      const res = {} as any;
      const next = jest.fn();

      await updateQualificationController(req, res, next);

      expect(
        QualificationService.updateQualificationService,
      ).toHaveBeenCalledWith("user_123", "qual_1", req.body.qualification);
      expect(sendSuccessResponse).toHaveBeenCalledWith(res, 200, {
        _id: "qual_1",
        instituteName: "Updated",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("deleteQualificationController", () => {
    it("returns 401 when unauthenticated", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: null });

      const req = { params: { qualificationId: "qual_1" } } as any;
      const res = {} as any;
      const next = jest.fn();

      await deleteQualificationController(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, code: "UNAUTHORIZED" }),
      );
      expect(
        QualificationService.deleteQualificationService,
      ).not.toHaveBeenCalled();
    });

    it("deletes qualification", async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: "user_123" });
      (
        QualificationService.deleteQualificationService as jest.Mock
      ).mockResolvedValue(null);

      const req = { params: { qualificationId: "qual_1" } } as any;
      const res = {} as any;
      const next = jest.fn();

      await deleteQualificationController(req, res, next);

      expect(
        QualificationService.deleteQualificationService,
      ).toHaveBeenCalledWith("user_123", "qual_1");
      expect(sendSuccessResponse).toHaveBeenCalledWith(res, 204, null);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
