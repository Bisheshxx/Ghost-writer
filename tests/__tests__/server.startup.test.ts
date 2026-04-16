describe("server startup", () => {
  const originalPort = process.env.PORT;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env.PORT = originalPort;
  });

  it("connects DB and starts listening on configured port", async () => {
    const listenMock = jest.fn((_port: string | number, cb?: () => void) => {
      if (cb) cb();
    });
    const connectDBMock = jest.fn().mockResolvedValue(undefined);
    const logSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    process.env.PORT = "7777";

    jest.doMock("../../src/app", () => ({
      __esModule: true,
      default: { listen: listenMock },
    }));
    jest.doMock("../../src/config/db", () => ({
      __esModule: true,
      default: connectDBMock,
    }));
    jest.doMock("dotenv", () => ({
      __esModule: true,
      default: { config: jest.fn() },
    }));

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("../../src/server");
    });
    await Promise.resolve();

    expect(connectDBMock).toHaveBeenCalledTimes(1);
    expect(listenMock).toHaveBeenCalledWith("7777", expect.any(Function));
    expect(logSpy).toHaveBeenCalledWith("📂 Connecting to Database...");
  });

  it("exits process when DB connection fails", async () => {
    const listenMock = jest.fn();
    const connectDBMock = jest.fn().mockRejectedValue(new Error("db down"));
    const errorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as never);

    process.env.PORT = "8888";

    jest.doMock("../../src/app", () => ({
      __esModule: true,
      default: { listen: listenMock },
    }));
    jest.doMock("../../src/config/db", () => ({
      __esModule: true,
      default: connectDBMock,
    }));
    jest.doMock("dotenv", () => ({
      __esModule: true,
      default: { config: jest.fn() },
    }));

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("../../src/server");
    });
    await Promise.resolve();

    expect(connectDBMock).toHaveBeenCalledTimes(1);
    expect(listenMock).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      "❌ Failed to start server:",
      expect.any(Error),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
