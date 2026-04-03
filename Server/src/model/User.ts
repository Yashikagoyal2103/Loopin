import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends mongoose.Document {
    _id: mongoose.Types.ObjectId | string;
    email: string;
    password?: string;
    full_name: string;
    username: string;
    profile_picture?: string;
    cover_picture?: string;
    bio?: string;
    location?: string;
    authProvider: 'local' | 'google' | 'facebook';
    googleId?: string;
    connections: mongoose.Types.ObjectId[];
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            select: false
        },
        full_name: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        profile_picture: {
            type: String,
            default: 'https://via.placeholder.com/150'
        },
        cover_picture: {
            type: String,
            default: ''
        },
        bio: {
            type: String,
            default: ''
        },
        location: {
            type: String,
            default: ''
        },
        authProvider: {
            type: String,
            enum: ['local', 'google', 'facebook'],
            default: 'local'
        },
        googleId: {
            type: String,
            sparse: true,
            unique: true
        },
        connections: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            default: []
        },
        followers: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            default: []
        },
        following: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            default: []
        }
    },
    {
        timestamps: true
    }
);

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const p = this.password as string;
    if (p.startsWith('$2a$') || p.startsWith('$2b$') || p.startsWith('$2y$')) {
        return next();
    }
    this.password = await bcrypt.hash(p, 12);
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
