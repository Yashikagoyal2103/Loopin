import type { Request, Response , NextFunction} from 'express';
import { getAuth } from '@clerk/express';

export const protect = async (req: Request, res: Response, next: NextFunction)=> {
    try{
        // const {userId }= await req.auth();
        const userId = getAuth(req);

        if(!userId){
            return res.json({success:false, message:"Not authenticated"})
        }
        next();
    }catch(error: unknown){
        res.json({success:false, message: (error as Error).message})
    }
} 