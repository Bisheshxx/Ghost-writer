import { User } from "../models/user.model";
import { ApiError } from "../utils/apiError";

export const resolveUserIdByClerkId = async (clerkId: string) => {
  const user = await User.findOne({ clerkId }).select("_id");

  if (!user) {
    throw new ApiError(404, "User not found", "NOT_FOUND");
  }

  return user._id;
};

export const handleUserCreated = async (clerkId: string) => {
  const existingUser = await User.findOne({ clerkId });

  if (existingUser) {
    throw new ApiError(409, "User already exists in database", "CONFLICT");
  }

  // Save the new user
  const newUser = await User.create({ clerkId });
  return newUser;
};
