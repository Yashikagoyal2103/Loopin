import { Inngest } from "inngest";
import User from "../model/User.js";
import sendEmail from "../config/nodeMailer.js";
import { Connection } from "../model/connections.js";
import Story from "../model/Story.js";
import Message from "../model/Message.js";
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Ensure database connection for Inngest functions
const ensureDbConnection = async () => {
  if (mongoose.connection.readyState !== 1) { // 1 = connected
    console.log('📡 Connecting to MongoDB for Inngest...');
    try {
      await mongoose.connect(process.env.DATABASE_URL!.trim(), {
                  dbName: 'LoopinDatabase'
              });
      console.log('✅ MongoDB connected for Inngest');
    } catch (error) {
      console.error('❌ MongoDB connection failed for Inngest:', error);
      throw error;
    }
  }
};
// Create a client to send and receive events
export const inngest = new Inngest({ id: "Loopin-app" });

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-creation" },
  { event: "app/user.created" },
  async ({ event, logger }) => {
    try {
      console.log('🔄 Processing app/user.created event');
      
      // ✅ ENSURE DATABASE CONNECTION FIRST
      await ensureDbConnection();
      console.log('✅ Database connection verified');
      
      const { userId, email, full_name, username, authProvider } = event.data;
      
      // Debug: Log the incoming data
      console.log('📋 Event data:', { 
        userId, 
        email, 
        full_name, 
        username,
        authProvider
      });
      
      if (!email || !userId) {
        throw new Error('Email and userId are required');
      }
      
      // ✅ Check if user already exists
      const existingUser = await User.findById(userId);
      if (existingUser) {
        console.log('⚠️ User already exists in database:', existingUser.email);
        return { success: true, message: 'User already exists' };
      }
      
      // ✅ Generate username if not provided
      let finalUsername = username || email.split('@')[0];
      console.log('👤 Generated username:', finalUsername);
      
      // ✅ Check username availability
      const userWithSameUsername = await User.findOne({ username: finalUsername });
      if (userWithSameUsername) {
        finalUsername = finalUsername + Math.floor(Math.random() * 1000);
        console.log('🔀 Username taken, using:', finalUsername);
      }
      
      // ✅ Create user (user is already created in authController, this is just for logging/notifications)
      console.log('📝 User created via:', authProvider || 'local');
      
      // User is already created in authController, just log success
      console.log('✅ User creation event processed:', userId);
      
      return { 
        success: true, 
        userId: userId,
        email: email 
      };
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR in syncUserCreation:');
      console.error('Error name:', (error as Error).name);
      console.error('Error message:', (error as Error).message);
      console.error('Error stack:', (error as Error).stack);
      
      // Throw the error so Inngest marks the function as failed
      throw error;
    }
  }
);
const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-updation" },
  { event: "app/user.updated" },
  async ({ event }) => {
    console.log('Inngest: Processing app/user.updated', event.data);
    
    // Ensure database connection
    await ensureDbConnection();
    
    const { userId, email, full_name, profile_picture } = event.data;
    
    if (!userId) {
      console.error('No userId found in update event:', event.data);
      return;
    }
    
    const updateUserData: any = {};
    if (email) updateUserData.email = email;
    if (full_name) updateUserData.full_name = full_name;
    if (profile_picture) updateUserData.profile_picture = profile_picture;
    
    console.log('Updating user:', userId, updateUserData);
    
    try {
      await User.findByIdAndUpdate(userId, updateUserData, { new: true });
      console.log('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      throw error; // Throw so Inngest marks as failed
    }
  }
);

//Inngest func. to delete data in the db
const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-deletion" },
  {event:"app/user.deleted"},
  async({event})=>{
    // Ensure database connection
    await ensureDbConnection();
    
    const { userId } = event.data
    if (!userId) {
      console.error('No userId found in delete event');
      return;
    }
    try {
      await User.findByIdAndDelete(userId)
      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
    }
);


//Inngest function to send reminder when a new connection request is added
const sendNewConnectionRequestRemainder = inngest.createFunction(
  { id: 'send-new-connection-request-remainder' },
  { event: "app/connection-request" },
  async ({ event, step }) => {
    // Ensure database connection
    await ensureDbConnection();
    
    const { connectionId } = event.data;

    await step.run('send-connection-request-mail', async () => {
      const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');
      if (!connection) {
        throw new Error(`Connection with ID ${connectionId} not found`);
      }

      const toUser = connection.to_user_id as any;
      const fromUser = connection.from_user_id as any;

      if (!toUser || !fromUser) {
        throw new Error('User data not populated properly');
      }

      const subject = `New Connection Request`;
      const body = `
      <div style="font-family:Arial, sans-serif; padding:20px;">
        <h2>Hi ${toUser.full_name},</h2>
        <p> You have a new connection request from ${fromUser.full_name} - @${fromUser.username}</p>
        <p> Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;"> here</a> to accept or reject the request </p>
        <br/>
        <p>Thanks, <br/> Loopin - Stay Connected</p>
      </div>`;

      await sendEmail({
        to: toUser.email,
        subject,
        body
      });
    });

    const in24Hours = new Date(Date.now() + 2 * 60 * 60 * 1000);
    await step.sleepUntil("wait-24-hours", in24Hours);
    
    await step.run('send-connection-request-reminder', async () => {
      const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');
      
      if (!connection) {
        throw new Error(`Connection with ID ${connectionId} not found`);
      }

      const toUser = connection.to_user_id as any;
      const fromUser = connection.from_user_id as any;

      if (!toUser || !fromUser) {
        throw new Error('User data not populated properly');
      }

      if ((connection as any)?.status === 'accepted') {
        return { message: "Already accepted" };
      }

      const subject = `New Connection Request`;
      const body = `
      <div style="font-family:Arial, sans-serif; padding:20px;">
        <h2>Hi ${toUser.full_name},</h2>
        <p> You have a new connection request from ${fromUser.full_name} - @${fromUser.username}</p>
        <p> Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;"> here</a> to accept or reject the request </p>
        <br/>
        <p>Thanks, <br/> Loopin - Stay Connected</p>
      </div>`;

      await sendEmail({
        to: toUser.email,
        subject,
        body
      });

      return{ message: "Reminder sent" };
    });
  }
);

//Inngest function to delete story after 24 hours of creation
const deleteStory = inngest.createFunction(
  {id: 'story-delete'},
  {event: 'app/story-created'},
  async({event, step})=>{
    // Ensure database connection
    await ensureDbConnection();
    
    const { storyId } = event.data;
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-24-hours", in24Hours);
    await step.run('delete-story', async()=>{
        await Story.findByIdAndDelete(storyId);
        return {message: "Story deleted after 24 hours"};
    })
  }
)

//Inngest dunction to send notification of unseen messages
const sendNotificationOfUnseenMessages = inngest.createFunction(
  { id: 'send-unseen-messages-notification' },
  { cron: "TZ=America/New_York 0 9 * * *" }, // Every day at 9 AM
  async ({ step }) => {
    // Ensure database connection
    await ensureDbConnection();
    
    const messages = await Message.find({ seen: false }).populate('to_user_id');
    
    const unseenCount = new Map();
    
    messages.forEach(message => {
      const toUser = message.to_user_id as unknown as { _id?: string };
      const userId = (toUser?._id || String(message.to_user_id)).toString();
      unseenCount.set(userId, (unseenCount.get(userId) || 0) + 1);
    });

    for (const [userId, count] of unseenCount) {
      const user = await User.findById(userId);
      
      if (!user) {
        console.log(`User ${userId} not found, skipping email`);
        continue;
      }

      const subject = `You have ${count} unseen messages`;
      const body = `
      <div style="font-family:Arial, sans-serif; padding:20px;">
        <h2>Hi ${user.full_name},</h2>
        <p>You have ${count} unseen message${count > 1 ? 's' : ''}</p>
        <p>Click <a href="${process.env.FRONTEND_URL}/messages" style="color: #10b981;">here</a> to view them.</p>
        <br/>
        <p>Thanks, <br/> Loopin - Stay Connected</p>
      </div>`;

      await sendEmail({
        to: user.email,
        subject,
        body
      });
      
      console.log(`Notification sent to ${user.email}`);
    }
    
    return { message: "Unseen message notifications sent" };
  }
);

// Create an empty array where we'll export future Inngest functions
// Remove old Clerk-based functions, keep only app events
export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    sendNewConnectionRequestRemainder,
    deleteStory,
    sendNotificationOfUnseenMessages
];