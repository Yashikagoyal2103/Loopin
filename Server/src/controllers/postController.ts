import type { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import fs from 'fs';
import { imageKit } from '../config/imageKit.js';
import Post from '../model/Post.js';
import User from '../model/User.js';
import mongoose from 'mongoose';

//Add Post
export const addPost = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { content, post_type } = req.body;
        
        const images = req.files as Express.Multer.File[] | undefined;
        
        let image_urls: string[] = [];

        if (images && images.length > 0) {
            image_urls = await Promise.all(
                images.map(async (image) => {
                    try {
                        // Check if file exists and has path
                        if (!image.path) {
                            throw new Error(`Image file is missing path: ${image.originalname}`);
                        }

                        const fileBuffer = fs.readFileSync(image.path);
                        const response = await imageKit.upload({
                            file: fileBuffer,
                            fileName: image.originalname,
                            folder: 'posts',
                        });
                        
                        const url = imageKit.url({
                            path: response.filePath,
                            transformation: [
                                { quality: 'auto' },
                                { format: 'webp' },
                                { width: '1280' }
                            ]
                        });
                        
                        return url;
                    } catch (imageError) {
                        console.error(`Error processing image ${image.originalname}:`, imageError);
                        throw imageError;
                    }
                })
            );
        }

        // Validate required fields
        if (!content) {
            return res.status(400).json({ success: false, message: "Content is required" });
        }

        const post = await Post.create({
            user: userId,
            content,
            image_urls,
            post_type: post_type || 'post' // default value
        });

        res.json({ 
            success: true, 
            message: 'Post added successfully',
            post 
        });

    } catch (error: unknown) {
        console.error("Error adding post:", error);
        res.status(500).json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error" 
        });
    }
}

//Get all posts
export const getFeedPosts = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({success:false, message:"User not found"});
        }

        //User connections and followings
        const userIds= [userId, ...user.connections, ...user.following];
        const posts = await Post.find({ user: { $in: userIds } }).populate('user').sort({ createdAt: -1 });

        res.json({success:true, posts});

    } catch (error: unknown) {
        console.error("Error getting post:", error);
        res.status(500).json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error" 
        });
    }
}

//Like post
export const likePost = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { postId } = req.body;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({success:false, message:"post not found"});
        }

         // Use MongoDB update operators instead of array methods
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Check if user already liked the post
        const alreadyLiked = await Post.findOne({
            _id: postId,
            likes_counts: userObjectId
        });

        if (alreadyLiked) {
            // Unlike - remove user from likes array
            await Post.findByIdAndUpdate(
                postId,
                { $pull: { likes_counts: userObjectId } }
            );
            return res.json({ success: true, message: "Post unliked" });
        } else {
            // Like - add user to likes array
            await Post.findByIdAndUpdate(
                postId,
                { $addToSet: { likes_counts: userObjectId } }
            );
            return res.json({ success: true, message: "Post liked" });
        }

    } catch (error: unknown) {
        console.error("Error Liking post:", error);
        res.status(500).json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error" 
        });
    }
}