import mongoose from "mongoose";

const connectDB = async () => {
  // If we already have a connection, don't create a new one
  if (mongoose.connection.readyState >= 1) return;

  try {
    const conn = await mongoose.connect(
      process.env.MONGO_DB_CONNECTION_STRING!,
      {
        dbName: "GhostV1",
      },
    );
    console.log(`🚀 MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Connection Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;
