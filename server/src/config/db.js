import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

/**
 * Export database connection for reusability
 * */

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGODB_URL);

export const connectDB = async () => {
  await mongoClient.connect();
  console.log('Connected to mongodb');
};
export const db = mongoClient.db(process.env.DB_NAME);
