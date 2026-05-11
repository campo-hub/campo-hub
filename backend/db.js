import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error('MONGO_URI environment variable is required');
}

const client = new MongoClient(uri, {
  serverApi: { version: '1' },
  tlsInsecure: process.env.MONGO_TLS_INSECURE === 'true',
});
let db;

export async function connectDb() {
  await client.connect();
  db = client.db(process.env.MONGO_DB_NAME || 'everything-campus');
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('MongoDB client not initialized. Call connectDb() first.');
  }
  return db;
}

export function getCollection(name) {
  return getDb().collection(name);
}

export async function closeDb() {
  await client.close();
}
