import { Inngest } from "inngest";
import User from "../model/User.js";

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

// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion
];