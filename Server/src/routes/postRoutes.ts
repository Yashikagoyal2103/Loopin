import express from 'express';
import { upload } from '../config/multer.js';
import { 
    addPost, 
    getFeedPosts, 
    likePost,
    addComment,
    getComments,
    sharePost,
    getLikedPosts
} from '../controllers/postController.js';
import { protect } from '../middlewares/auth.js';

const postRouter = express.Router();

// Existing routes
postRouter.post('/add', protect, upload.array('images', 4), addPost);
postRouter.get('/feed', protect, getFeedPosts);
postRouter.post('/like', protect, likePost);

// New routes for comments and shares
postRouter.post('/comment', protect, addComment);
postRouter.get('/comments/:postId', protect, getComments);
postRouter.post('/share', protect, sharePost);
postRouter.get('/liked', protect, getLikedPosts);

export default postRouter;