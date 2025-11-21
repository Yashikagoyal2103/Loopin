import type { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import fs from 'fs';
import { imageKit } from '../config/imageKit.js';
import User from '../model/User.js';
import { inngest } from '../inngest/index.js';
import Message from '../model/Message.js';

// Define the type for connections object
interface Connections {
  [userId: string]: Response;
}

//Create an empty object to store SS Event connections
const connections: Connections = {};

//Controller function for the SSE endpoint
export const sseContoller = async (req: Request, res: Response) => {
    const {userId}= getAuth(req);
    console.log('New Client connected', userId);
    if(!userId){
        return res.status(401).json({success:false, message: "Unauthorized"});
    }

    //Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    //Add the client's responce object to the connection object
    connections[userId]= res;

    //Send an intial event to the client
    res.write('log: Connected to SSE server\n\n');

    //Handle client disconnection
    req.on('close', () => {
        //Remove the client's connection from the connections object
        console.log('Client disconnected', userId);
        delete connections[userId];
    });
}

//Send Message
export const sendMessage = async (req: Request, res: Response) => {
    try{
        const { userId }= getAuth(req);
        const {to_user_id, text } = req.body;
        const image = req.file;
        if(!image){
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        let media_url="";
        let message_type=image ?'image' :'text';

        if(message_type === 'image'){
            const fileBuffer= fs.readFileSync(image.path);
            const response= await imageKit.upload({
                file:fileBuffer,
                fileName: image.originalname,
            });
            media_url= imageKit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '1280' }
                ]
            })
        }

        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url
        });

        res.json({success: true, message: 'Message sent successfully'});

        //Send SSE event to the recipient if connected
        const meassgeWithUserData = await Message.findById(message._id).populate('from_user_id');

        if(connections[to_user_id]){
            connections[to_user_id].write(`data: ${JSON.stringify(meassgeWithUserData)}\n\n`);
        }

    }catch (error: unknown) {
        console.error("Error Sending message:", error);
        res.status(500).json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error" 
        });
    }
}

//Get chat messages
export const getChatMessages = async (req: Request, res: Response) => {
    try{
        const { userId }= getAuth(req);
        const { to_user_id }= req.body;
        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id: to_user_id },
                { from_user_id: to_user_id, to_user_id: userId }
            ]
        }).sort({ createdAt: 1 });
        //mark messages as seen
        await Message.updateMany({ from_user_id: to_user_id, to_user_id: userId},{ seen: true });

        res.json({ success: true, messages });
    }catch (error: unknown) {
        console.error("Error Getting Chat message:", error);
        res.status(500).json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error" 
        });
    }
}

//het user recent messages
export const getUserRecentMessages = async (req: Request, res: Response) => {
    try{
        const { userId }= getAuth(req);
        const messages = await Message.find({to_user_id: userId}).populate('from_user_id to_user_id').sort({ createdAt: -1 });

        res.json({ success: true, messages });
    }catch (error: unknown) {
        console.error("Error Getting Recent message:", error);
        res.status(500).json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error" 
        });
    }
}