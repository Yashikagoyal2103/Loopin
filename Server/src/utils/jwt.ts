import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as NonNullable<SignOptions['expiresIn']>;

export interface TokenPayload {
    userId: string;
    email: string;
}

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
};


// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
// const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

// interface TokenPayload {
//     userId: string;
//     email: string;
// }

// export const generateToken = (payload: TokenPayload): string => {
//     return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
// };

// export const generateRefreshToken = (payload: TokenPayload): string => {
//     return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });
// };

// export const verifyToken = (token: string): TokenPayload => {
//     return jwt.verify(token, JWT_SECRET) as TokenPayload;
// };

// export const verifyRefreshToken = (token: string): TokenPayload => {
//     return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
// };
