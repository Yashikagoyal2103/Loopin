import { Inngest } from "inngest";
import User from "../model/User.js";
import sendEmail from "../config/nodeMailer.js";
import { Connection } from "../model/connections.js";
import Story from "../model/Story.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "Loopin-app" });

//Inngest func. to save data in the db
const syncUserCreation = inngest.createFunction(
  { id: "Sync-user-from-clerk" },
  {event:"clerk/user.created"},
  async({event})=>{
    const {id , first_name , last_name, email_address, image_url}= event.data
    let username= email_address[0].email.address.split('@')[0]

    //Check availability of username
    const user = await User.findOne({username})

    if (user) {
        username= username + Math.floor(Math.random() * 1000)
    }

    const userData ={
        _id:id,
        email: email_address[0].email_address,
        full_name: first_name + " "+ last_name,
        profile_picture: image_url,
        username
    } 
    await User.create(userData);
  }
); 

//Inngest func. to update data in the db
const syncUserUpdation = inngest.createFunction(
    { id: "update-user-from-clerk" },
    {event:"clerk/user.updated"},
    async({event})=>{
        const {id , first_name , last_name, email_address, image_url}= event.data

    const updateUserData = {
        email: email_address[0].email_address,
        full_name: first_name+ ' ' + last_name,
        profile_picture: image_url
    }
    await User.findByIdAndUpdate(id, updateUserData)
  }
)


//Inngest func. to delete data in the db
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  {event:"clerk/user.deleted"},
  async({event})=>{
    const {id }= event.data
    await User.findByIdAndDelete(id)
    }
);


//Inngest function to send reminder when a new connection request is added
const sendNewConnectionRequestRemainder = inngest.createFunction(
  { id: 'send-new-connection-request-remainder' },
  { event: "app/connection-request" },
  async ({ event, step }) => {
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
    const { storyId } = event.data;
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-24-hours", in24Hours);
    await step.run('delete-story', async()=>{
        await Story.findByIdAndDelete(storyId);
        return {message: "Story deleted after 24 hours"};
    })
  }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    sendNewConnectionRequestRemainder
];