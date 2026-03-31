import User from "../model/User.js";
import type { Request, Response } from 'express';
import { getAuth } from '../middlewares/auth.js';
import fs from 'fs';
import { imageKit } from "../config/imageKit.js";
import { Connection } from "../model/connections.js";
import Post from "../model/Post.js";
import { inngest } from "../inngest/index.js";

const normalizeUser = (user: any) => {
    if (!user) return user;
    const doc = user.toObject ? user.toObject() : user;
    if (!doc.cover_photo && doc.cover_picture) {
        doc.cover_photo = doc.cover_picture;
    }
    return doc;
};

// controllers/userController.ts
export const getUserData = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        return res.status(200).json({
            success: true,
            user: normalizeUser(user)
        });
    } catch (error: unknown) {
        console.error('Error in getUserData:', error);
        return res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }
};

//update user data 
// export const updateUserData = async (req: Request, res: Response) => {
//     try {
//         const { userId } = getAuth(req);
//         if (!userId) {
//             return res.status(401).json({ success: false, message: "User not authenticated" });
//         }

//         let { username, bio, location , full_name } = req.body;

//         const tempUser= await User.findById(userId);
//         if (!tempUser) {
//             return res.status(404).json({ success: false, message: "User not found" });
//         }

//         // Provide default value if username is undefined/null
//         if (!username) {
//             username = tempUser.username;
//         }

//         if (tempUser.username !== username) {
//             const existingUser = await User.findOne({ username });
//             if (existingUser) {
//                 // Username is already taken, revert to original
//                 username = tempUser.username;
//             }
//         }

//         const updatedData: any = {
//             username,
//             bio: bio || tempUser.bio,
//             location: location || tempUser.location,
//             full_name: full_name || tempUser.full_name
//         };

//         const profile = req.files && 'profile' in req.files ? req.files.profile[0] : null;
//         const cover = req.files && 'cover' in req.files ? req.files.cover[0] : null;

//         if (profile) {
//             const buffer= fs.readFileSync(profile.path);
//             const responce= await imageKit.upload({
//                 file:buffer,
//                 fileName:profile.originalname,
//             })
//             const url= imageKit.url({
//                 path:responce.filePath,
//                 transformation: [
//                     {quality: 'auto'},
//                     {format :'webp'},
//                     {width: '512'}
//                 ]
//             })
//             updatedData.profile_picture =url;
//         }

//         if (cover) {
//             const buffer= fs.readFileSync(cover.path);
//             const responce= await imageKit.upload({
//                 file:buffer,
//                 fileName:cover.originalname,
//             })
//             const url= imageKit.url({
//                 path:responce.filePath,
//                 transformation: [
//                     {quality: 'auto'},
//                     {format :'webp'},
//                     {width: '1280'}
//                 ]
//             })
//             updatedData.cover_photo =url;
//         }

//         const user= await User.findByIdAndUpdate(userId, updatedData, {new: true})
//         res.json({ success: true,user,  message: "Profile updated successfully" });

//     }catch(error: unknown){
//         console.error("Error fetching user data:", error);
//         res.json({ success: false, message: (error as Error).message });
//     }
// }

// export const updateUserData = async (req: Request, res: Response) => {
//     try {
//         const { userId } = getAuth(req);
//         if (!userId) {
//             return res.status(401).json({ success: false, message: "User not authenticated" });
//         }

//         console.log('=== UPDATE USER DATA START ===');
//         console.log('Request files:', req.files);
//         console.log('Request body:', req.body);

//         let { username, bio, location, full_name } = req.body;
 
//         const tempUser = await User.findById(userId);
//         if (!tempUser) {
//             return res.status(404).json({ success: false, message: "User not found" });
//         }

//         if (!username) {
//             username = tempUser.username;
//         }

//         if (tempUser.username !== username) {
//             const existingUser = await User.findOne({ username });
//             if (existingUser) {
//                 username = tempUser.username;
//             }
//         }

//         const updatedData: any = {
//             username,
//             bio: bio || tempUser.bio,
//             location: location || tempUser.location,
//             full_name: full_name || tempUser.full_name
//         };

//         // Check if files exist
//         const hasProfile = req.files && 'profile' in req.files;
//         const hasCover = req.files && 'cover' in req.files;
        
//         console.log('Has profile file:', hasProfile);
//         console.log('Has cover file:', hasCover);

//         const profile = hasProfile && req.files ? req.files.profile_picture[0] : null;
//         const cover = hasCover && req.files ? req.files.cover[0] : null;

//         if (profile) {
//             console.log('Processing profile picture:', profile.originalname);
//             try {
//                 const buffer = fs.readFileSync(profile.path);
//                 const response = await imageKit.upload({
//                     file: buffer,
//                     fileName: profile.originalname,
//                 });
//                 const url = imageKit.url({
//                     path: response.filePath,
//                     transformation: [
//                         { quality: 'auto' },
//                         { format: 'webp' },
//                         { width: '512' }
//                     ]
//                 });
//                 updatedData.profile_picture = url;
//                 console.log('Profile picture uploaded successfully:', url);
//             } catch (profileError) {
//                 console.error('Error uploading profile picture:', profileError);
//             }
//         }

//         if (cover) {
//             console.log('Processing cover photo:', cover.originalname);
//             console.log('Cover file size:', cover.size);
//             console.log('Cover file path:', cover.path);
            
//             try {
//                 const buffer = fs.readFileSync(cover.path);
//                 console.log('Cover buffer size:', buffer.length);
                
//                 const response = await imageKit.upload({
//                     file: buffer,
//                     fileName: cover.originalname,
//                 });
//                 console.log('ImageKit response for cover:', response);
                
//                 const url = imageKit.url({
//                     path: response.filePath,
//                     transformation: [
//                         { quality: 'auto' },
//                         { format: 'webp' },
//                         { width: '1280' }
//                     ]
//                 });
//                 updatedData.cover_photo = url;
//                 console.log('Cover photo uploaded successfully:', url);
//             } catch (coverError) {
//                 console.error('Error uploading cover photo:', coverError);
//                 // Don't throw, just log the error
//             }
//         } else {
//             console.log('No cover photo file found in request');
//         }

//         console.log('Final updatedData before save:', {
//             ...updatedData,
//             profile_picture: updatedData.profile_picture ? 'exists' : 'not set',
//             cover_photo: updatedData.cover_photo ? 'exists' : 'not set'
//         });

//         const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
        
//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found after update" });
//         }

//         console.log('User after update:', {
//             id: user._id,
//             profile_picture: user.profile_picture ? 'exists' : 'not set',
//             cover_photo: user.cover_picture ? 'exists' : 'not set'
//         });
        
//         res.json({ success: true, user, message: "Profile updated successfully" });

//     } catch (error: unknown) {
//         console.error("Error updating user data:", error);
//         res.status(500).json({ success: false, message: (error as Error).message });
//     }
// }

export const updateUserData = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        let { username, bio, location, full_name } = req.body;
 
        const tempUser = await User.findById(userId);
        if (!tempUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Provide default value if username is undefined/null
        if (!username) {
            username = tempUser.username;
        }

        if (tempUser.username !== username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                username = tempUser.username;
            }
        }

        const updatedData: any = {
            username,
            bio: bio || tempUser.bio,
            location: location || tempUser.location,
            full_name: full_name || tempUser.full_name
        };

        // Safe file checking
        if (req.files) {
            const files = req.files as any;
            
            // Handle profile picture
            if (files.profile && files.profile[0]) {
                const profile = files.profile[0];
                try {
                    const buffer = fs.readFileSync(profile.path);
                    const response = await imageKit.upload({
                        file: buffer,
                        fileName: profile.originalname,
                    });
                    const url = imageKit.url({
                        path: response.filePath,
                        transformation: [
                            { quality: 'auto' },
                            { format: 'webp' },
                            { width: '512' }
                        ]
                    });
                    updatedData.profile_picture = url;
                    console.log('Profile picture uploaded');
                } catch (error) {
                    console.error('Profile upload error:', error);
                }
            }
            
            // Handle cover photo
            if (files.cover && files.cover[0]) {
                const cover = files.cover[0];
                try {
                    const buffer = fs.readFileSync(cover.path);
                    const response = await imageKit.upload({
                        file: buffer,
                        fileName: cover.originalname,
                    });
                    const url = imageKit.url({
                        path: response.filePath,
                        transformation: [
                            { quality: 'auto' },
                            { format: 'webp' },
                            { width: '1280' }
                        ]
                    });
                    updatedData.cover_photo = url;
                    console.log('Cover photo uploaded successfully:', url);
                } catch (error) {
                    console.error('Cover upload error:', error);
                }
            }
        }

        if (updatedData.cover_photo) {
            // Keep legacy field in sync for older UI reads.
            updatedData.cover_picture = updatedData.cover_photo;
        }

        const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.json({ success: true, user: normalizeUser(user), message: "Profile updated successfully" });

    } catch (error: unknown) {
        console.error("Error updating user data:", error);
        res.status(500).json({ success: false, message: (error as Error).message });
    }
}

//Find users using useranme, email, loaction, name
export const discoverUser = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { input }= req.body;
         const allUsers = await User.find(
            {
                $or:[
                    {username: new RegExp(input, 'i')},
                    {email: new RegExp(input, 'i')},
                    {full_name: new RegExp(input, 'i')},
                    {location: new RegExp(input, 'i')}
                ]
            }
         )
         const filteredUsers= allUsers.filter((user)=> user._id.toString() !== userId);

         res.json({ success: true, users: filteredUsers });
    }catch(error:unknown){
        console.log(error as Error);
        res.json({ success: false, message: (error as Error).message });
    }
}

//follow user 
export const followUser = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const id = (req.params.id || req.body.id) as string;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        // Check if target user id is provided
        if (!id) {
            return res.status(400).json({ success: false, message: "Target user ID is required" });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Current user not found" });
        }

        // Check if user is trying to follow themselves
        if (userId === id) {
            return res.status(400).json({ success: false, message: "Cannot follow yourself" });
        }
        // Check if already following
        if(user.following.includes(id)){
            return res.json({ success: false, message: "Already following the user" });
        }

        // Find the target user and check if it exists
        user.following.push(id);
        await user.save();

        const toUser= await User.findById(id);
        if (!toUser) {
            return res.status(404).json({ success: false, message: "Target user not found" });
        }
        toUser.followers.push(userId);
        await toUser.save();

        res.json({ success: true, message: "User followed successfully" });

    }catch(error:unknown){
        console.log(error as Error);
        res.json({ success: false, message: (error as Error).message });
    }
}

//unfollow user
export const unfollowUser = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const id = (req.params.id || req.body.id) as string;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        // Check if target user id is provided
        if (!id) {
            return res.status(400).json({ success: false, message: "Target user ID is required" });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Current user not found" });
        }
         // Find the target user and check if it exists
        user.following= user.following.filter(user=> user !== id);
        await user.save();

        const toUser= await User.findById(id);
        if (!toUser) {
            return res.status(404).json({ success: false, message: "Target user not found" });
        }
        toUser.followers= toUser.followers.filter(user=> user !== userId);
        await toUser.save();

        res.json({ success: true, message: "User unfollowed successfully" });

    }catch(error:unknown){
        console.log(error as Error);
        res.json({ success: false, message: (error as Error).message });
    }
}

// send connection request
export const sendConnectionRequest = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { id }= req.body;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        //check if user has send more then 20 connection requests in last 24 hours
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const connectionsRequests = await Connection.find({from_user_id: userId, 
            createdAt: { $gt: last24Hours }})
        if(connectionsRequests.length >=20){
            return res.status(429).json({ success: false, message: "You have sent more than 20 connection requests in the last 24 hours. Please try again later." });
        }

        //Check if user is already connected
        const connection = await Connection.findOne({
            $or: [
                {from_user_id :userId, to_user_id:id},
                {from_user_id :id, to_user_id:userId},
            ]
        });
        if(!connection){
            const newConnection= await Connection.create({
                from_user_id: userId,
                to_user_id: id,
            })

            await inngest.send({
                name:'app/connection-request',
                data:{ConnectionId: newConnection._id}
            })
            return res.json({ success: true, message: "Connection request sent successfully" });
        }else if(connection && connection.status === 'accepted'){
            return res.json({ success: false, message: "You are already connected with this user" });
        }

        res.json({ success: false, message: "Connection request pending" });

    }catch (error:unknown){
        console.log(error as Error);
        res.json({ success: false, message: (error as Error).message });
    }
}

//get user connections
export const getUserConnections = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);

        const user= await User.findById(userId).populate('connections followers following');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found in database" });
        }


        const connections= await user.connections;
        const followers= await user.followers;
        const following= await user.following;

        const pendingConnections= (await Connection.find({to_user_id:userId, status:'pending'})
        .populate('from_user_id')).map(connection=> connection.from_user_id);

        res.json({ success: true, connections, followers, following, pendingConnections });


    }catch (error:unknown){
        console.log(error as Error);
        res.json({ success: false, message: (error as Error).message });
    }
}

//Accept the connection request
export const acceptConnectionRequest = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { id }= req.body;
        if(!userId){
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const connection = await Connection.findOne({from_user_id :id, to_user_id:userId});
        if(!connection){
            return res.status(404).json({ success: false, message: "Connection request not found" });
        }

        const user= await User.findById(userId);
        if(!user){
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.connections.push(id);
        await user.save();

        const toUser= await User.findById(id);
        if(!toUser){
            return res.status(404).json({ success: false, message: "User not found" });
        }
        toUser.connections.push(userId);
        await toUser.save();

        connection.status= 'accepted';
        await connection.save();

        res.json({ success: true, message: "Connection request accepted successfully" });


    }catch (error:unknown){
        console.log(error as Error);
        res.json({ success: false, message: (error as Error).message });
    }
}

//Get user profiles
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const { profileId }= req.body;
        const profile = await User.findById(profileId);

        if(!profile){
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        const posts= await Post.find({user: profileId}).populate('user')
        res.json({ success: true, profile: normalizeUser(profile), posts });

    }catch (error:unknown){
        console.log(error as Error);
        res.json({ success: false, message: (error as Error).message });
    }       
}