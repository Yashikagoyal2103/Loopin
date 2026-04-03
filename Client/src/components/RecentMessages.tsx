import { useState , useEffect } from 'react'
import {  type RecentMessage } from '../assets/assets'
import { Link } from 'react-router-dom'
import moment from 'moment';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';


const RecentMessages = () => {

    const [messages, setMessages] = useState<RecentMessage[]>([])
    const { user } = useAuth();


    const fetchRecentMessages = async () => {
        try{
            const { data } = await api.get('/api/user/recent-messages')
            if(data.success){
                //Group messages by sender and get the latest message for each sender
                const groupedMessages = data.messages.reduce((acc: Record<string, RecentMessage>, message:RecentMessage) =>{
                    const senderId = message.from_user_id._id;
                    if(!acc[senderId] || new Date(message.createdAt) > new Date(acc[senderId].createdAt)){
                        acc[senderId] =message;
                    }
                    return acc;
                },{})

                //Sort messages by date
                const sortedMessages =( Object.values(groupedMessages)as RecentMessage[]).sort((a,b) =>{
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                })
                setMessages(sortedMessages)
            }else{
                toast.error(data.message)
            }
        }catch (error :unknown){
            toast.error((error as Error).message)
        }        
    }

    useEffect(() => {
        if(user){
            fetchRecentMessages()
            const interval = setInterval(fetchRecentMessages, 30000); 
            return () => { clearInterval(interval); }; 
        }
        
    },[user])

  return (
    <div className="bg-white max-w-xs mt-6 p-4 min-h-20 rounded-md shadow text-xs text-slate-800">
        <h3 className="font-semibold text-slate-800 mb-4">Recent Messages</h3>
        <div className="flex flex-col max-h-56 no-scrollbar overflow-y-scroll hide-scrollbar">
            {
                messages.map((message, index) => (
                    <Link key={index} to={`/messages/${message.from_user_id._id}`} className="flex items-start gap-2 py-2 hover:bg-slate-600">
                        <img src={message.from_user_id.profile_picture} alt="Profile" className='w-8 h-8 rounded-full '/>
                        <div className='w-full'>
                            <div className="flex justify-between">
                                <p className="font-medium">{message.from_user_id.full_name}</p>
                                <p className='text-[10px] text-slate-400'>{moment(message.createdAt).fromNow()}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className='text-gray-500'>{message.text ? message.text :'Media'}</p>
                                {!message.seen && <p className='bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px]'>1</p>}
                            </div>
                        </div>
                    </Link>
                ))
            }
        </div>
    </div>
  )
}

export default RecentMessages