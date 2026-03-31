import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true },
    full_name: { type: String, required: true },
    password: { type: String, select: false }, // Don't return password by default
    bio: { type: String, default: "Hey there! I am using Loopin." },
    profile_picture: { type: String, default: "" },
    cover_photo: { type: String, default: "" },
    // Backward compatibility for legacy records/clients.
    cover_picture: { type: String, default: "" },
    location: { type: String, default: "" },
    followers: { type: [String], ref: "User", default: [] },
    following: { type: [String], ref: "User", default: [] },
    connections: { type: [String], ref: "User", default: [] },
    // OAuth fields
    googleId: { type: String, sparse: true },
    facebookId: { type: String, sparse: true },
    authProvider: { 
        type: String, 
        enum: ['local', 'google', 'facebook'], 
        default: 'local' 
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
}, { timestamps: true, minimize: true });

const User = mongoose.model('User', userSchema);

export default User;