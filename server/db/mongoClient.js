export async function connectToMongoDB(mongoClient) {
  try {
    await mongoClient.connect();
    console.log("Connected to MongoDB ✅");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // Stop the server if MongoDB fails to connect
  }
}


