import type { Request, Response } from 'express';
import User from '../model/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { inngest } from '../inngest/index.js';
import mongoose from 'mongoose';

const authCookieBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax'
};

// Signup
export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, full_name, username } = req.body;

        // Validation
        if (!email || !password || !full_name) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and full name are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Generate username if not provided
        let finalUsername = username || email.split('@')[0];
        const usernameExists = await User.findOne({ username: finalUsername });
        if (usernameExists) {
            finalUsername = finalUsername + Math.floor(Math.random() * 1000);
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const userId = new mongoose.Types.ObjectId().toString();
        const user = await User.create({
            _id: userId,
            email,
            password: hashedPassword,
            full_name,
            username: finalUsername,
            authProvider: 'local'
        });

        // Generate tokens
        const token = generateToken({ userId: user._id, email: user.email });
        const refreshToken = generateRefreshToken({ userId: user._id, email: user.email });

        res.cookie('token', token, {
            ...authCookieBase,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.cookie('refreshToken', refreshToken, {
            ...authCookieBase,
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        try {
            await inngest.send({
                name: 'app/user.created',
                data: {
                    userId: user._id,
                    email: user.email,
                    full_name: user.full_name,
                    username: user.username
                }
            });
        } catch (e) {
            console.error('Inngest app/user.created:', e);
        }

        // Return user (without password)
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            user: userResponse,
            message: 'User created successfully'
        });
    } catch (error: unknown) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: (error as Error).message || 'Error creating user'
        });
    }
};

// Login
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user with password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user has a password (OAuth users might not)
        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: 'Please login with your OAuth provider'
            });
        }

        // Compare password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate tokens
        const token = generateToken({ userId: user._id, email: user.email });
        const refreshToken = generateRefreshToken({ userId: user._id, email: user.email });

        res.cookie('token', token, {
            ...authCookieBase,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.cookie('refreshToken', refreshToken, {
            ...authCookieBase,
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        // Return user (without password)
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            user: userResponse,
            message: 'Login successful'
        });
    } catch (error: unknown) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: (error as Error).message || 'Error logging in'
        });
    }
};

// Logout
export const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error: unknown) {
        res.status(500).json({
            success: false,
            message: (error as Error).message || 'Error logging out'
        });
    }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error: unknown) {
        res.status(500).json({
            success: false,
            message: (error as Error).message || 'Error fetching user'
        });
    }
};
