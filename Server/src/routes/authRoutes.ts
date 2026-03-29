import express from 'express';
import passport from '../config/passport.js';
import { signup, login, logout, getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { inngest } from '../inngest/index.js';

const authRoute = express.Router();

const oauthCookieBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax'
};

// Local auth routes
authRoute.post('/signup', signup);
authRoute.post('/login', login);
authRoute.post('/logout', logout);
authRoute.get('/me', protect, getCurrentUser);

// Google OAuth routes
authRoute.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

authRoute.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_auth_failed' }),
    async (req, res) => {
        try {
            const user = req.user as any;
            
            // Generate tokens
            const token = generateToken({ userId: user._id, email: user.email });
            const refreshToken = generateRefreshToken({ userId: user._id, email: user.email });

            res.cookie('token', token, {
                ...oauthCookieBase,
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.cookie('refreshToken', refreshToken, {
                ...oauthCookieBase,
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            // Trigger Inngest event
            await inngest.send({
                name: 'app/user.created',
                data: {
                    userId: user._id,
                    email: user.email,
                    full_name: user.full_name,
                    username: user.username,
                    authProvider: 'google'
                }
            });

            // Redirect to frontend
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/?oauth=success`);
        } catch (error) {
            console.error('Google OAuth callback error:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/login?error=oauth_failed`);
        }
    }
);

export default authRoute;
