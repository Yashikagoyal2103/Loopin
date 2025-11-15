import mongoose from 'mongoose';
import dotenv from 'dotenv';

const ConnectDB = async () => {
    dotenv.config();
    try {
        await mongoose.connect(process.env.DATABASE_URL!, {
            dbName: 'LoopinDatabase'
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); 
    }
}

export default ConnectDB;