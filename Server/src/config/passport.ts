import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../model/User.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists with this Google ID
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // Check if user exists with this email
                const email = profile.emails?.[0]?.value;
                if (email) {
                    user = await User.findOne({ email });
                    if (user) {
                        // Link Google account to existing user
                        user.googleId = profile.id;
                        user.authProvider = 'google';
                        await user.save();
                        return done(null, user);
                    }
                }

                // Create new user
                const userId = new mongoose.Types.ObjectId().toString();
                const username = email?.split('@')[0] || `user_${profile.id}`;
                let finalUsername = username;
                
                // Ensure username is unique
                const usernameExists = await User.findOne({ username: finalUsername });
                if (usernameExists) {
                    finalUsername = username + Math.floor(Math.random() * 1000);
                }

                user = await User.create({
                    _id: userId,
                    email: email || `google_${profile.id}@temp.com`,
                    googleId: profile.id,
                    full_name: profile.displayName || 'User',
                    username: finalUsername,
                    profile_picture: profile.photos?.[0]?.value || '',
                    authProvider: 'google'
                });

                return done(null, user);
            } catch (error) {
                return done(error as Error, undefined);
            }
        }
    )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
