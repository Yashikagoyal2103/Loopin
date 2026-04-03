import { type User } from '../assets/assets'
import { MapPin, MessageCircle, Plus, UserPlus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../app/store'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import { fetchUser } from '../features/user/userSlice'
import { fetchConnections } from '../features/connections/connectionsSlice'
import { useEffect, useState } from 'react'

const UserCard = ({ user }: { user: User }) => {

    const currentUser = useSelector((state: RootState) => state.user.value);
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const hasId = (arr: Array<string | { toString(): string }> = [], id?: string) =>
        !!id && arr.some((v) => v?.toString() === id);

    const safeIdList = (value: unknown): Array<string | { toString(): string }> =>
        Array.isArray(value) ? (value as Array<string | { toString(): string }>) : [];

    useEffect(() => {
        const following = safeIdList(currentUser?.following);
        const connections = safeIdList(currentUser?.connections);

        setIsFollowing(hasId(following, user._id));
        setIsConnected(hasId(connections, user._id));
    }, [currentUser, user._id]);


    const handleFollow = async () => {
        try{
            const { data } = await api.post(`/api/user/follow/${user._id}`)
        if(data.success){
            toast.success(data.message)
            setIsFollowing(true);
            dispatch(fetchUser())
            dispatch(fetchConnections())
        }else{
            toast.error(data.message)
        }
        }catch (error :unknown){
            toast.error((error as Error).message)
        }             
    }

    const handleConnectionRequest = async () => {   
        if (isConnected) {
            return navigate('/messages/' + user._id)
        }
        try{
            const { data } = await api.post('/api/user/connect',{id: user._id})
        if(data.success){
            toast.success(data.message)
            setIsConnected(true);
            dispatch(fetchConnections());
        }else{
            toast.error(data.message)
        }
        }catch (error :unknown){
            toast.error((error as Error).message)
        } 
    }
  return (
    <div
      key={user._id}
      className="flex w-full max-w-md flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 pt-6 shadow-sm sm:w-72 dark:border-slate-700 dark:bg-slate-900"
    >
        <div className='text-center'>
            <img src={user.profile_picture} alt="Profile" className='rounded-full w-16 shadow-md mx-auto' />
            <p className='mt-4 font-semibold'>{user.full_name}</p>
            {user.username && <p className='font-light text-gray-500'>@{user.username}</p>}
            {user.bio && <p className='text-gray-600 mt-2 px-4 text-center text-sm'>{user.bio}</p>}
        </div>

        <div className='flex items-center justify-center gap-2mt-4 text-xs text-gray-600 '>
            <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1'> 
                <MapPin className='w-6 h-4'/>{user.location}
            </div>
            <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1'>
                <span>{user.followers.length}</span> Followers
            </div>
        </div>

        <div className='flex mt-4 gap-2'>
            {/* Follow Button */}
            <button onClick={handleFollow} disabled={isFollowing} className='flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gradient-to-r
            from-indigo-500 to-purple-600 py-2 text-white transition hover:from-indigo-600 hover:to-purple-700 active:scale-95'>
                <UserPlus />{isFollowing ? 'Following' : 'Follow' }
            </button>

            {/* Connection request button / message button */}
            <button onClick={handleConnectionRequest} className='group flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md border border-slate-200 text-slate-500 transition active:scale-95 dark:border-slate-600 dark:text-slate-300 sm:w-16'>
                {
                    isConnected ? 
                    <MessageCircle className="w-5 h-5 group-hover:scale-105 transition" />
                    :
                    <Plus className='w-5 h-5 group-hover:scale-105 transition'/>
                }
            </button>
        </div>

    </div>
  )
}

export default UserCard