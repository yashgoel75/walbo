import mongoose from "mongoose";

let isConnected = false; // To prevent multiple connections

export async function connectMongoDB() {
  if (isConnected) {
    console.log("Already connected to MongoDB.");
    return;
  }

  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/test');

    isConnected = true;
    console.log("Connected to MongoDB.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
