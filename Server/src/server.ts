import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ConnectDB from './config/db.js';
import { serve } from "inngest/express";
import { inngest , functions } from "../src/inngest/index.js";
import { clerkMiddleware } from '@clerk/express';
import userRoute from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

//middlewares
app.use(cors());
app.use(express.json());
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use(clerkMiddleware());

// Connect to MongoDB
await ConnectDB();

// Route
app.get('/', (req, res) => {
  res.send('Server is running!!');
});
app.use('./api/user', userRoute);

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});