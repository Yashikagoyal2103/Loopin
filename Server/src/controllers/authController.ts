import type { Request, Response } from 'express';
import User from '../model/User.js';
import { comparePassword } from '../utils/password.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { inngest } from '../inngest/index.js';
import mongoose from 'mongoose';

const authCookieBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
    path: '/'
};

const setAuthCookies = (res: Response, userId: string, email: string): void => {
    const token = generateToken({ userId, email });
    const refreshToken = generateRefreshToken({ userId, email });
    res.cookie('token', token, {
        ...authCookieBase,
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.cookie('refreshToken', refreshToken, {
        ...authCookieBase,
        maxAge: 30 * 24 * 60 * 60 * 1000
    });
};

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, full_name, username } = req.body;

        if (!email || !password || !full_name) {
            res.status(400).json({
                success: false,
                message: 'Email, password, and full name are required'
            });
            return;
        }

        const existingUser = await User.findOne({ email: String(email).toLowerCase().trim() });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
            return;
        }

        let finalUsername = username || String(email).split('@')[0];
        const usernameExists = await User.findOne({ username: finalUsername });
        if (usernameExists) {
            finalUsername = finalUsername + Math.floor(Math.random() * 1000);
        }

        const userId = new mongoose.Types.ObjectId();
        // Plain password — User model pre-save hook hashes once (do not use hashPassword here or it double-hashes)
        const user = await User.create({
            _id: userId,
            email: String(email).toLowerCase().trim(),
            password,
            full_name,
            username: finalUsername,
            authProvider: 'local'
        });

        try {
            await inngest.send({
                name: 'app/user.created',
                data: {
                    userId: user._id.toString(),
                    email: user.email,
                    full_name: user.full_name,
                    username: user.username
                }
            });
        } catch (e) {
            console.error('Inngest app/user.created:', e);
        }

        setAuthCookies(res, user._id.toString(), user.email);

        const userResponse = user.toObject();
        delete (userResponse as { password?: string }).password;

        res.status(201).json({
            success: true,
            user: userResponse,
            message: 'Account created successfully'
        });
    } catch (error: unknown) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: (error as Error).message || 'Error creating user'
        });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
            return;
        }

        const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
            return;
        }

        if (!user.password) {
            res.status(401).json({
                success: false,
                message: 'Please login with your OAuth provider'
            });
            return;
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
            return;
        }

        setAuthCookies(res, user._id.toString(), user.email);

        const userResponse = user.toObject();
        delete (userResponse as { password?: string }).password;

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

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie('token', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
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

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as { user?: { userId?: string; id?: string } }).user?.userId
            || (req as { user?: { userId?: string; id?: string } }).user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.json({
            success: true,
            user
        });
    } catch (error: unknown) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: (error as Error).message || 'Error fetching user'
        });
    }
};
