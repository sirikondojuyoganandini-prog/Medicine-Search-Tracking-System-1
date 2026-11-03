import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/meditrack';
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Successfully connected to database at: ${uri}`);
  } catch (err) {
    console.error(`[MongoDB] Connection error: ${err.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};
