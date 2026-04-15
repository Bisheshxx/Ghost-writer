import mongoose from "mongoose";

const connectDB = async () => {
  // If we already have a connection, don't create a new one
  if (mongoose.connection.readyState >= 1) return;

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(`🚀 MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Connection Error: ${(error as Error).message}`);
    // Exit the process with failure if the DB can't connect
    process.exit(1);
  }
};

export default connectDB;
