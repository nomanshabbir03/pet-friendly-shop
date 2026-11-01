import mongoose from 'mongoose';

const mongodbUri = process.env.MONGODB_URI?.trim();

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

type GlobalWithMongoose = typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const globalWithMongoose = globalThis as GlobalWithMongoose;
const cached: MongooseCache = globalWithMongoose.mongooseCache ?? (globalWithMongoose.mongooseCache = { conn: null, promise: null });

if (!mongodbUri) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

const MONGODB_URI: string = mongodbUri;

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      retryWrites: true,
      tls: true,
    }).then((mongooseInstance) => mongooseInstance);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;

    const message = error instanceof Error ? error.message : String(error);

    // Always log — this previously only logged outside production, which meant a
    // hung/failed connection on Vercel left no trace in Runtime Logs at all.
    console.error('[MongoDB] Connection failed:', message);

    throw new Error(`Database connection failed: ${message}`);
  }
}
