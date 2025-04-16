import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
  throw new Error('Please define the MONGODB_URL environment variable');
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  let mongoose: Cached | undefined;
}

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: Cached;
};

const cached: Cached = globalWithMongoose.mongoose || { conn: null, promise: null };

globalWithMongoose.mongoose ??= cached;

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      family: 4,
    };

    cached.promise = mongoose.connect(MONGODB_URL ?? "", opts).then((mongoose) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Connected to MongoDB');
      }
      return mongoose;
    }).catch((err) => {
      console.error('MongoDB connection error:', err);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
