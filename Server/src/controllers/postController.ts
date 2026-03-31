import type { Request, Response } from 'express';
import { getAuth } from '../middlewares/auth.js';
import fs from 'fs';
import { imageKit } from '../config/imageKit.js';
import Post from '../model/Post.js';
import User from '../model/User.js';


//Add Post
export const addPost = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const { content } = req.body;
        const images = req.files as Express.Multer.File[] | undefined;
        
        let image_urls: string[] = [];

        // Handle image uploads if any
        if (images && images.length > 0) {
            try {
                image_urls = await Promise.all(
                    images.map(async (image) => {
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
                    })
                );
            } catch (imageError) {
                console.error("Error processing images:", imageError);
                return res.status(500).json({ 
                    success: false, 
                    message: "Error uploading images" 
                });
            }
        }

        // Validate that either content or images exist
        if (!content && image_urls.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Content or image is required" 
            });
        }

        // Create post - remove post_type if it's not in your schema
        const post = await Post.create({
            user: userId,
            content: content || "", // Provide empty string if no content
            image_urls: image_urls,
            likes_count: [],
            comments: [],
            shares_count: 0
        });

        // Populate user details for the response
        const populatedPost = await Post.findById(post._id)
            .populate('user', 'full_name username profile_picture');

        res.json({ 
            success: true, 
            message: 'Post added successfully',
            post: populatedPost 
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
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const networkIds = [userId, ...(user.connections || []), ...(user.following || [])];
        const query = networkIds.length > 1 ? { user: { $in: networkIds } } : {};

        const posts = await Post.find(query)
            .populate('user', 'full_name username profile_picture')
            .populate('comments.user', 'full_name username profile_picture')
            .sort({ createdAt: -1 });

        res.json({ success: true, posts });

    } catch (error: unknown) {
        console.error("Error getting posts:", error);
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
        // const alreadyLiked = post.likes_count?.includes(userId);
        const alreadyLiked = post.likes_count?.some(id => id.toString() === userId);

        if (alreadyLiked) {
            // Unlike - remove user from likes array
            await Post.findByIdAndUpdate(
                postId,
                { $pull: { likes_count: userId } }
            );
            return res.json({ success: true, message: "Post unliked" });
        } else {
            // Like - add user to likes array
            await Post.findByIdAndUpdate(
                postId,
                { $addToSet: { likes_count: userId } }
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


// Add Comment to Post
export const addComment = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { postId, content } = req.body;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        
        if (!content || content.trim() === '') {
            return res.status(400).json({ success: false, message: "Comment content is required" });
        }
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        
        // Add comment to post
        const comment = {
            user: userId,
            content: content.trim(),
            createdAt: new Date()
        };
        
        post.comments.push(comment);
        await post.save();
        
        // Populate user details for the new comment - FIX: use correct field name
        const updatedPost = await Post.findById(postId)
            .populate('comments.user', 'full_name username profile_picture');
        
        // Check if updatedPost exists
        if (!updatedPost) {
            return res.status(404).json({ success: false, message: "Post not found after update" });
        }
        
        const newComment = updatedPost.comments[updatedPost.comments.length - 1];
        
        res.json({ 
            success: true, 
            comment: newComment,
            message: "Comment added successfully" 
        });
        
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ success: false, message: (error as Error ).message });
    }
};

// Get Comments for a Post
export const getComments = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        
        const post = await Post.findById(postId)
            .populate('comments.user', 'full_name username profile_picture');
        
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        
        // Return comments in reverse order (newest first)
        const comments = [...post.comments].reverse();
        
        res.json({ success: true, comments });
        
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ success: false, message: (error as Error ).message });
    }
};

// Share Post
export const sharePost = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { postId } = req.body;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        
        // Increment share count
        post.shares_count = (post.shares_count || 0) + 1;
        await post.save();
        
        res.json({ 
            success: true, 
            shares: post.shares_count,
            message: "Post shared successfully" 
        });
        
    } catch (error) {
        console.error("Error sharing post:", error);
        res.status(500).json({ success: false, message: (error as Error ).message });
    }
};