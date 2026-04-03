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
    <div  key={user._id} className="p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200  rounded-md">
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
            <button onClick={handleFollow} disabled={isFollowing} className='w-full py-2 rounded-md flex justify-center items-center gap-2 bg-gradient-to-r
            from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active-scale-95 transition text-white cursor-pointer'>
                <UserPlus />{isFollowing ? 'Following' : 'Follow' }
            </button>

            {/* Connection request button / message button */}
            <button onClick={handleConnectionRequest} className='flex items-center justify-center w-16 border text-slate-500 group rounded-md cursor-pointer active:scalle-95 transition'>
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