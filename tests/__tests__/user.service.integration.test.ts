import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { handleUserCreated } from "../../src/services/user.service";
import { User } from "../../src/models/user.model";

describe("User service integration (MongoDB)", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: "GhostV1" });
  }, 60000);

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("creates and persists a user document", async () => {
    const created = await handleUserCreated("integration_user_1");

    expect(created.clerkId).toBe("integration_user_1");

    const fromDb = await User.findOne({ clerkId: "integration_user_1" });
    expect(fromDb).not.toBeNull();
    expect(fromDb?.clerkId).toBe("integration_user_1");
  });

  it("throws conflict on duplicate clerkId", async () => {
    await handleUserCreated("integration_user_2");

    await expect(handleUserCreated("integration_user_2")).rejects.toMatchObject(
      {
        statusCode: 409,
        code: "CONFLICT",
      },
    );
  });
});
