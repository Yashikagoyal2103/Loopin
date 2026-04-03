import { Calendar, MapPin, PenBox, Verified, UserPlus, UserCheck } from 'lucide-react'
import { type User , type Post} from '../assets/assets'
import moment from 'moment'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'

type Props = {
  user: User;
  posts: Post[];
  profileId: string | number |unknown ;
  setShowEdit: (show: boolean) => void;
  onProfileUpdated?: () => void;
};

const UserProfileInfo = ({user, posts, profileId , setShowEdit, onProfileUpdated}: Props) => {
  const currentUser = useSelector((state: RootState) => state.user.value);
  const isOwnProfile = !profileId || currentUser?._id === user._id;
  const isFollowingFromStore = !!currentUser?._id && (currentUser.following || []).includes(user._id);
  const [isFollowing, setIsFollowing] = useState(isFollowingFromStore);

  useEffect(() => {
    setIsFollowing(isFollowingFromStore);
  }, [isFollowingFromStore, user._id]);

  const toggleFollow = async () => {
    if (!user?._id) return;
    try {
      const url = isFollowing ? `/api/user/unfollow/${user._id}` : `/api/user/follow/${user._id}`;
      const { data } = await api.post(url);
      if (data.success) {
        toast.success(data.message);
        setIsFollowing((prev) => !prev);
        onProfileUpdated?.();
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    }
  };

  return (
    <div className='relative py-4 px-6 md:px-8 bg-white '>
        <div className='flex flex-col md:flex-row items-start gap-6'>
            <div className='w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full '>
                <img src={user.profile_picture} alt="Profile" className='absolute rounded-full z-2'/>
            </div>


            <div className='w-full pt-16 md:pt-0 md:pl-36 '>
                <div className='flex flex-col md:flex-row items-start justify-between '>
                    <div>
                        <div className='flex items-center gap-3'>
                            <h1 className='text-2xl font-bold text-gray-900'>{user.full_name}</h1>
                            <Verified className='w-6 h-6 text-blue-500'/>
                        </div>
                        <p className='text-gray-600'>{user.username ? `@${user.username}` : 'Add a username'}</p>
                    </div>
                    <div className='flex items-center gap-2 mt-4 md:mt-0'>
                      {isOwnProfile ? (
                        <button onClick={() => setShowEdit(true)} className='flex items-center gap-2 border border-gray-300 hover:bg-gray-50
                        px-4 py-2 rounded-lg font-medium transition-colors'>
                          <PenBox className='w-4 h-4 '/>
                          Edit
                        </button>
                      ) : (
                        <button onClick={toggleFollow} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                          ${isFollowing ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'}`}>
                          {isFollowing ? <UserCheck className='w-4 h-4' /> : <UserPlus className='w-4 h-4' />}
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                </div>
                <p className='text-gray-700 text-sm max-w-md mt-4'>{user.bio}</p>

                <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4'>
                    <span className='flex items-center gap-1.5'>
                        <MapPin className='w-4 h-4'/>
                        {user.location ? user.location :'Add Location'}
                    </span>
                    <span className='flex items-center gap-1.5'>
                        <Calendar className='w-4 h-4' />
                        Joined <span className='font-medium'>{moment(user.createdAt).fromNow()}</span>
                    </span>
                </div>

                <div className='flex items-center gap-6 mt-6 border-t  border-gray-200 pt-4'>
                    <div>
                        <span className='sm:text-xl font-bold text-gray-900'>{posts.length}</span>
                        <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Posts</span>
                    </div>
                </div>
                <span className='sm:text-xl font-bold text-gray-900'>{user.followers.length}</span>
                <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Followers</span>
            </div>

        </div>

    </div>
  )
}

export default UserProfileInfo