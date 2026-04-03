import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { buildCorsOptions } from './config/corsOptions.js';
import ConnectDB from './config/db.js';
import { serve } from "inngest/express";
import { inngest , functions } from "./inngest/index.js";
import passport from './config/passport.js';
import authRoute from './routes/authRoutes.js';
import userRoute from './routes/userRoutes.js';
import postRouter from './routes/postRoutes.js';
import storyRouter from './routes/storyRoutes.js';
import messageRouter from './routes/messageRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(cors(buildCorsOptions()));

app.use(express.json());
app.use(cookieParser());

// Session middleware (for OAuth)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Inngest endpoint
app.use("/api/inngest", serve({ client: inngest, functions }));

// Connect to MongoDB
await ConnectDB();

// Routes
app.get('/', (req, res) => {
  res.send('Server is running!!');
});

// Auth routes (public)
app.use('/api/auth', authRoute);

// Protected routes
app.use('/api/user', userRoute);
app.use('/api/post', postRouter);
app.use('/api/story', storyRouter);
app.use('/api/message', messageRouter);

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});