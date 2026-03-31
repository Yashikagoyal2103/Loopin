import type { Request, Response } from 'express';
import { getAuth } from '../middlewares/auth.js';
import fs from 'fs';
import { imageKit } from '../config/imageKit.js';
import Story from '../model/Story.js';
import User from '../model/User.js';
import { inngest } from '../inngest/index.js';

//Add Story
export const addUserStory = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { content, media_type, background_color }= req.body;
        const media = req.file;
        let media_url= "";

        if ((media_type === 'image' || media_type === 'video') && !media) {
            return res.status(400).json({ success: false, message: "Media file is required" });
        }

        if (media && (media_type === 'image' || media_type === 'video')) {
            const fileBuffer = fs.readFileSync(media.path);
            const response = await imageKit.upload({
                file: fileBuffer,
                fileName: media.originalname,
            });
            media_url= response.url;
        }

        if (media_type === 'text' && !content) {
            return res.status(400).json({ success: false, message: "Story text is required" });
        }

        //create story
        const story = await Story.create({
            user: userId,
            content: content || "",
            media_type,
            media_url,
            background_color,
        }); 

        //schedule story deletion after 24 hours
        await inngest.send({
            name: 'app/story-created',
            data:{storyId: story._id},
        })

        res.status(201).json({ success: true, story });

    }catch (error: unknown) {
        console.error("Error Adding Story:", error);
        res.status(500).json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error" 
        });
    }
}

//Get User Stories
export const getStories = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({success:false, message:"User not found"});
        }

        //User connections and followings
        const userIds= [userId, ...user.connections, ...user.following];
        const stories = await Story.find({ user: { $in: userIds } }).populate('user').sort({ createdAt: -1 });

        res.json({success:true, stories});
    }catch (error: unknown) {
        console.error("Error Adding Story:", error);
        res.status(500).json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error" 
        });
    }
}