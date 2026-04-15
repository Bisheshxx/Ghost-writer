import app from "./app";
import dotenv from "dotenv";
import connectDB from "./config/db";

dotenv.config();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // This is where you'll eventually connect to MongoDB
    console.log("📂 Connecting to Database...");
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Ghost is listening at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
