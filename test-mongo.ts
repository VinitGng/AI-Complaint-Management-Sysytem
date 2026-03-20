import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

async function test() {
  try {
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log("Connected to In-Memory MongoDB successfully!");
    process.exit(0);
  } catch (err) {
    console.error("In-Memory MongoDB connection error:", err);
    process.exit(1);
  }
}

test();
