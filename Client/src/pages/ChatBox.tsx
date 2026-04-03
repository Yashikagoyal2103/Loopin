import { useState, useRef ,useEffect } from 'react'
import {type User } from '../assets/assets'
import { ImageIcon, SendHorizonal } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../app/store'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { addMessage, fetchMessages, resetMessages } from '../features/messages/messagesSlice'


const ChatBox = () => {

  const {messages} = useSelector((state:RootState) => state.messages)
  const { userId } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const [text, setText] = useState('')
  const [image, setImage ] = useState<File | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const messageEndRef = useRef<HTMLDivElement>(null)

  const { connections, following } = useSelector((state: RootState) => state.connections)

  //Message type
  interface Message {
    _id: string;
    to_user_id: string;
    text: string;
    message_type: string;
    media_url?: string;
    createdAt: string;
  }


   const fetchUserMessages = async () => {
    try {
      if (!userId) {
        toast.error('No user selected for messaging');
        return;
      }
      dispatch(fetchMessages({ userId }))
    } catch (error: unknown) {
      toast.error((error as Error).message);
    }
  };
  const sendMessage = async() =>{
    try{
      if(!text && !image) return 
      if (!userId) {
        toast.error('No user selected for messaging');
        return;
      }

      const formData = new FormData()
      formData.append('to_user_id' , userId)
      formData.append('text', text);
      if(image){
        formData.append('image', image);
      }
            
      const { data } = await api.post('/api/message/send', formData)
      if(data.success){
        setText('')
        setImage(null)
        dispatch(addMessage(data.message))
      }else{
        throw new Error(data.message || 'Failed to send message')
      }
    }catch( error:unknown){
      toast.error((error as Error).message)
    }
  }

  useEffect(() =>{
    fetchUserMessages()
    
    return ()=> {
      dispatch(resetMessages())
    }
  },[userId])

  useEffect(() => {
    if(!userId){
      setUser(null)
      return;
    }
    const usersMap = new Map<string, User>();
    [...connections, ...following].forEach((u: User) => {
      if (u?._id) usersMap.set(u._id, u);
    });
    setUser(usersMap.get(userId) || null);
  },[connections, following, userId])


  useEffect(() =>{
    messageEndRef.current?.scrollIntoView({behavior: "smooth"})
  }, [messages])

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Select a user to start chatting</p>
      </div>
    );
  }

  return user && (
    <div className='flex flex-col h-screen'>
      <div className='flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r fron-indigo-50 to-purple-50 border-b border-gray-300'>
        <img src={user.profile_picture} className='size-8 rounded-full' alt='Profile picture' />
        <div>
          <p className='font-medium'>{user.full_name}</p>
          <p className='text-sm text-gray-500 -mt-1.5'>@{user.username}</p>
        </div>
      </div>
      <div className='p-5 md:px-10 h-full overflow-y-scroll'>
        <div className='space-y-4 max-w-4xl mx-auto'>
          {
            messages.slice().sort((a:Message,b:Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((message:Message, index) =>(
              <div key={index} className={`flex flex-col ${message.to_user_id !== user._id ? 'items-start' : 'items-end'} `}>
                <div className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${message.to_user_id !== user._id ? 
                  'rounded-bl-none' : 'rounded-br-none'}`}>
                  {
                    message.message_type === 'image' && <img src={message.media_url} className='w-full max-w-sm mb-1 rounded-lg' alt="image"/>
                  }
                  <p>{message.text}</p>
                </div>
              </div>
            ))
          }
          <div ref={messageEndRef} />
          </div>
        </div>


        <div className='px-4'>
          <div className='flex items-center gap-3 pl-5 p-1.4 bg-white w-full max-w-xl mx-auto border border-gray-200 mb-5 shadow rounded-full'>
            <input type='text' placeholder='Text a message...' onKeyDown={e=> e.key === 'Enter' && sendMessage()} 
            className='flex-1 outline-none text-slate-700 ' value={text} onChange={(e) => setText(e.target.value)}/>

            <label htmlFor='image' >
              {image ? <img src={URL.createObjectURL(image)} className='h-8 rounded' alt='image'/> 
              : <ImageIcon className='size-7 text-gray-400 cursor-pointer'/>
              }
              <input  type='file' id='image' accept="image/*" hidden
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files[0]) {
                    setImage(files[0]);
                  }}}/>
            </label>

            <button onClick={sendMessage} aria-label='Send' className='bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700
             hover:to-purple-800 active:scale-95 cursor-pointer p-2 text-white rounded-full'>
              <SendHorizonal size={18} />
            </button>
          </div>
        </div>


    </div>
  )
}

export default ChatBox