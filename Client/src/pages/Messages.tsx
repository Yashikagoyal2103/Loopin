import { Eye, MessageSquare } from 'lucide-react'
import {type User } from '../assets/assets'
import { useNavigate  } from 'react-router-dom'
import type { RootState } from '../app/store'
import { useSelector } from 'react-redux'

const Messages = () => {

  const { connections, following } = useSelector((state:RootState) => state.connections)
  const navigate = useNavigate()
  const usersMap = new Map<string, User>();
  [...connections, ...following].forEach((u: User) => {
    if (u?._id) usersMap.set(u._id, u);
  });
  const users = Array.from(usersMap.values());

  
  return (
    <div className="min-h-screen overflow-y-scroll relative bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
          <p className="text-slate-600">Talk to your friends and family</p>
        </div>

        {/* Connected Users */}
        <div className="flex flex-col gap-3">
          {users.length === 0 && (
            <div className="max-w-xl p-6 bg-white rounded-md shadow text-slate-600">
              No users to message yet. Follow/connect with people from Discover or Connections.
            </div>
          )}
          {users.map((user:User) => (
            <div key={user._id} className='max-w-xl flex flex-wrap gap-5 p-6 bg-white rounded-md shadow'>
              <img src={user.profile_picture} alt="Profile" className='rounded-full size-12 mx-auto'/>
              <div className='flex-1'>
                <p className='font-medium text-slate-700'>{user.full_name}</p>
                <p className='text-slate-500'>@{user.username}</p>
                <p className='text-sm text-gray-600'>{user.bio}</p>
              </div>

              <div className='flex flex-col gap-2 mt-4'>
                <button onClick={() => navigate(`/messages/${user._id}`)} type='button' className="size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800
                 active:scale-95 transition cursor-pointer gap-1" aria-label="jbjbj">
                  <MessageSquare className='w-4 h-4' />
                </button>

                <button type='button' onClick={() => navigate(`/profile/${user._id}`)} className="size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800
                 active:scale-95 transition cursor-pointer " aria-label="seen">
                  <Eye className='w-4 h-4' />
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    )
}

export default Messages