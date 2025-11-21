import express from 'express';
// import { getUserData, updateUserData, followUser, unfollowUser, discoverUser, sendConnectionRequest,acceptConnectionRequest, getUserConnections} from '../controllers/userController';
import { 
  getUserData, 
  updateUserData, 
  followUser, 
  unfollowUser, 
  discoverUser, 
  sendConnectionRequest, 
  acceptConnectionRequest, 
  getUserConnections, 
  getUserProfile
} from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';
import { upload } from '../config/multer.js';

const userRoute = express.Router();

userRoute.get('/data', protect, getUserData);
userRoute.post('/update', protect, upload.fields([{ name: 'profile', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), updateUserData);
userRoute.post('/follow/:id', protect, followUser);
userRoute.post('/unfollow/:id', protect, unfollowUser);
userRoute.post('/discover', protect, discoverUser);
userRoute.post('/connect', protect, sendConnectionRequest);
userRoute.post('/accept' , protect, acceptConnectionRequest);
userRoute.get('/connections', protect, getUserConnections);
userRoute.post('/profiles' , protect, getUserProfile)

export default userRoute;