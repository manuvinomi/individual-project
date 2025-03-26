import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI as string);
const dbName = 'cluster0';

const connectDB = async () => {
  await client.connect();
  return client.db(dbName);
};

export { connectDB };
