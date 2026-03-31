import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const ConnectDB = async () => {
    const uri = process.env.DATABASE_URL?.trim();
    if (!uri) {
        console.error('MongoDB connection error: DATABASE_URL is missing');
        process.exit(1);
    }
    try {
        await mongoose.connect(uri, {
            dbName: 'LoopinDatabase'
        });
        console.log('MongoDB connected');
    } catch (error: unknown) {
        console.error('MongoDB connection error:', error);
        process.exit(1); 
    }
}

export default ConnectDB;