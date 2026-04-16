import mongoose from "mongoose";
import connectDB from "../../src/config/db";

describe("connectDB", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not reconnect when mongoose is already connected", async () => {
    Object.defineProperty(mongoose.connection, "readyState", {
      value: 1,
      configurable: true,
    });
    const connectSpy = jest.spyOn(mongoose, "connect");

    await connectDB();

    expect(connectSpy).not.toHaveBeenCalled();
  });

  it("connects with env URI and GhostV1 dbName", async () => {
    Object.defineProperty(mongoose.connection, "readyState", {
      value: 0,
      configurable: true,
    });
    process.env.MONGO_DB_CONNECTION_STRING = "mongodb://127.0.0.1:27017";

    const connectSpy = jest.spyOn(mongoose, "connect").mockResolvedValue({
      connection: { host: "127.0.0.1" },
    } as any);

    const logSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    await connectDB();

    expect(connectSpy).toHaveBeenCalledWith("mongodb://127.0.0.1:27017", {
      dbName: "GhostV1",
    });
    expect(logSpy).toHaveBeenCalled();
  });

  it("logs and exits when connection fails", async () => {
    Object.defineProperty(mongoose.connection, "readyState", {
      value: 0,
      configurable: true,
    });
    process.env.MONGO_DB_CONNECTION_STRING = "mongodb://127.0.0.1:27017";

    jest
      .spyOn(mongoose, "connect")
      .mockRejectedValue(new Error("connect failed"));
    const errorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as never);

    await connectDB();

    expect(errorSpy).toHaveBeenCalledWith(
      "❌ Connection Error: connect failed",
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
