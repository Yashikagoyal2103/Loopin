import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import User from '../model/User.js';

// JWT `protect` sets id + email; Passport OAuth attaches a Mongoose user (uses _id).
declare global {
    namespace Express {
        interface User {
            id?: string;
            email?: string;
        }
    }
}

/** Use on routes behind `protect` when you need a guaranteed user id. */
export const getAuth = (req: Request): { userId: string } => {
    const u = req.user;
    if (!u) throw new Error('Not authenticated');
    const id = u.id ?? (u as { _id?: { toString(): string } })._id?.toString();
    if (!id) throw new Error('Not authenticated');
    return { userId: id };
};

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from cookies or Authorization header
        let token: string | undefined;

        // Check cookies first (for httpOnly cookies)
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // Check Authorization header as fallback
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated. Please login.'
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        // Check if user still exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists.'
            });
        }

        // Attach user to request
        req.user = {
            id: decoded.userId,
            email: decoded.email
        };

        next();
    } catch (error: unknown) {
        return res.status(401).json({
            success: false,
            message: (error as Error).message || 'Invalid token'
        });
    }
};


// import type { Request, Response, NextFunction } from 'express';
// import { verifyToken } from '../utils/jwt.js';
// import User from '../model/User.js';

// interface AuthRequest extends Request {
//     user?: {
//         userId: string;
//         email: string;
//     };
// }

// export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         // Get token from cookies or Authorization header
//         let token: string | undefined;

//         // Check cookies first (for httpOnly cookies)
//         if (req.cookies && req.cookies.token) {
//             token = req.cookies.token;
//         }
//         // Check Authorization header as fallback
//         else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
//             token = req.headers.authorization.split(' ')[1];
//         }

//         if (!token) {
//             res.status(401).json({
//                 success: false,
//                 message: 'Not authenticated. Please login.'
//             });
//             return;
//         }

//         // Verify token
//         const decoded = verifyToken(token);

//         // Check if user still exists
//         const user = await User.findById(decoded.userId);
//         if (!user) {
//             res.status(401).json({
//                 success: false,
//                 message: 'User no longer exists.'
//             });
//             return;
//         }

//         // Attach user to request
//         req.user = {
//             userId: decoded.userId,
//             email: decoded.email
//         };

//         next();
//     } catch (error: unknown) {
//         res.status(401).json({
//             success: false,
//             message: (error as Error).message || 'Invalid token'
//         });
//     }
// };

// // Helper function to get authenticated user
// export const getAuth = (req: AuthRequest): { userId: string; email: string } => {
//     if (!req.user) {
//         throw new Error('Not authenticated');
//     }
//     return req.user;
// };
