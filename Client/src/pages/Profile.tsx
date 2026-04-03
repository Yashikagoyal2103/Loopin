import { useState, useEffect } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import {type Post  , type User} from '../assets/assets'
import Loading from '../components/Loading'
import UserProfileInfo from '../components/UserProfileInfo'
import PostCard from '../components/PostCard'
import moment from 'moment'
import ProfileModel from '../components/ProfileModel'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'

const Profile = () => {
  const location = useLocation()
  const currentUser = useSelector((state: RootState) => state.user.value)

  const { profileId } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] =useState<Post[]>([])
  const [likedPosts, setLikedPosts] = useState<Post[]>([])
  const [activeTab, setActiveTab ] = useState('posts')
  const [showEdit, setShowEdit ]=  useState<boolean>(false)

  const fetchUser = async (profileId:string) => {
    try{
      const { data } = await api.post(`/api/user/profiles`, {profileId})
      if(data.success){
        setUser(data.profile)
        setPosts(data.posts)
      }
    }catch(error:unknown){
      toast.error((error as Error).message)
    }
  }

  const fetchLikedPosts = async () => {
    try {
      const { data } = await api.get('/api/post/liked');
      if (data.success) {
        setLikedPosts(data.posts || []);
      }
    } catch (error: unknown) {
      toast.error((error as Error).message);
    }
  };

  useEffect(() => {
    if(profileId){
      fetchUser(profileId)
    }else if (currentUser?._id) {
    fetchUser(currentUser._id);
    fetchLikedPosts();
  }
  }, [profileId, currentUser])

  useEffect(() => {
    if (location.hash === '#likes') setActiveTab('likes')
  }, [location.hash])

  return user? (
    <div className="relative min-h-full bg-gray-50 dark:bg-slate-950 md:h-full md:min-h-0 md:overflow-y-auto">
      <div className="mx-auto max-w-3xl p-3 pb-8 md:p-6">
        {/* Profile Card */}
        <div className='bg-white rounded-2xl shadow overflow-hidden'>
          {/* Cover Photo */}
          <div className='h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200'>
            {user.cover_photo && <img src={user.cover_photo} alt="Photo" className='w-full h-full object-cover' />}
          </div>

          {/* User info */}
          <UserProfileInfo
            user={user}
            posts={posts}
            profileId={profileId}
            setShowEdit={setShowEdit}
            onProfileUpdated={() => {
              if (profileId) fetchUser(profileId);
              else if (currentUser?._id) fetchUser(currentUser._id);
            }}
          />
        </div>


        {/* Tabs */}
        <div className='mt-6'>
          <div className='bg-white rounded-xl shadow p-1 flex max-w-md mx-auto'>
            {["posts" , "media" , "likes"].map((tab) =>(
              <button onClick={() => setActiveTab(tab)} key={tab} className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeTab === tab ? "bg-indigo-600 text-white" : "text-gray-600 hover-text-gray-900 "}`}>
                {tab.charAt(0).toUpperCase() +  tab.slice(1)}
              </button>
            ) )}
          </div>
          {/* Posts
          {activeTab == 'posts' && (
            <div>{posts.map((post) => <PostCard key={post._id} post={post}/>)}</div>
          )} */}

          {/* Posts */}
          {activeTab == 'posts' && (
            <div className="space-y-4 mt-6">
              {posts.map((post) => <PostCard key={post._id} post={post}/>)}
            </div>
          )}

          {/* Media */}
          {activeTab === 'media' &&(
          <div className='flex flex-wrap gap-4 mt-6 max-w-6xl'>
            {posts.filter((post) => post.image_urls.length > 0).map((post) =>(
              <>
              {post.image_urls.map((image, index) => (
                <Link target='_blank' to={image} key={index} className='relative group'>
                <img src={image} key={index} className='w-64 aspect-video object-cover' alt='Image'/>
                <p className='absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100  transition duration-300'>Posted {moment(post.createdAt).fromNow()}</p>
                </Link>
              ))}
              </>
              ))}
          </div>
          )}

          {/* Likes */}
          {activeTab === 'likes' && (
            <div className='space-y-4 mt-6'>
              {likedPosts.length === 0 ? (
                <p className='text-gray-500 text-center py-8'>No liked posts yet.</p>
              ) : (
                likedPosts.map((post) => <PostCard key={post._id} post={post} />)
              )}
            </div>
          )}
        </div>      
      </div>
      {/* Edit Profile model */}
      {showEdit && <ProfileModel setShowEdit={setShowEdit}/>}
    </div>
  ):(<Loading/>)
}

export default Profile