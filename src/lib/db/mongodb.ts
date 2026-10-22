import 'server-only';
import { MongoClient, Db } from 'mongodb';
import { env } from '@/lib/env';

declare global {
  var _mongoClientInstance: MongoClient | undefined;
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const rawUri = env.MONGODB_URI;
// Normalize localhost to 127.0.0.1 to avoid IPv6 DNS timeout delays on Windows
const uri = rawUri.replace('://localhost:', '://127.0.0.1:');

const options = {
  maxPoolSize: 20,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 2000,
  connectTimeoutMS: 2000,
};

export async function getMongoClient(): Promise<MongoClient> {
  if (global._mongoClientInstance) {
    return global._mongoClientInstance;
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client
      .connect()
      .then((connected) => {
        global._mongoClientInstance = connected;
        return connected;
      })
      .catch((err) => {
        console.warn('⚠️ Warning: MongoDB connection attempt failed:', err.message);
        global._mongoClientPromise = undefined;
        global._mongoClientInstance = undefined;
        throw err;
      });
  }

  return global._mongoClientPromise;
}

export async function getDatabase(dbName?: string): Promise<Db> {
  const connectedClient = await getMongoClient();
  return connectedClient.db(dbName || env.MONGODB_DB_NAME);
}

export const getDb = getDatabase;

export const mongoClient = new MongoClient(uri, options);
export const mongoDb = mongoClient.db(env.MONGODB_DB_NAME);

export default getMongoClient;
