import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lexconnect';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        if (error.message.includes('authentication failed')) {
          console.error('💡 Authentication failed. Check:');
          console.error('   1. Username and password in MONGODB_URI');
          console.error('   2. URL encode special characters in password (< = %3C, > = %3E)');
          console.error('   3. Database user has proper permissions');
        }
        if (error.message.includes('IP')) {
          console.error('💡 IP not whitelisted. Add your IP in MongoDB Atlas Network Access');
        }
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error('❌ Database connection failed:', e?.message);
    throw e;
  }

  return cached.conn;
}

export default connectDB;

