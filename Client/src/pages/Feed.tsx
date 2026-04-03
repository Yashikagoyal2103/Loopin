import { useEffect, useState } from 'react';
import Loading from '../components/Loading';
import { type Post } from '../assets/assets';     //type is written to separate value import from interface/type import
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard'
import RecentMessages from '../components/RecentMessages';
import {assets} from '../assets/assets';
import api from '../api/axios';
import toast from 'react-hot-toast';


const Feed = () => {
  const [feeds, setFeeds] = useState<Post[]>([]);
  const [ loading , setLoading ] = useState<boolean>(true);

  const fetchFeeds = async () => {
    try{
      setLoading(true)
      const {data} = await api.get('/api/post/feed')

      if(data.success){
        setFeeds(data.posts)
      }else{
        toast.error(data.message)
      }
    }catch(error :unknown){
      toast.error((error as Error).message)
    }
    setLoading(false)
  }

  useEffect(()=> {
    fetchFeeds()
  },[])

  return !loading ? (
    <div className="flex w-full max-w-full flex-1 flex-col items-stretch justify-start md:min-h-0 md:h-full md:overflow-y-auto md:overscroll-contain xl:flex-row xl:items-start xl:justify-center xl:gap-8 xl:pr-5">
      {/* Stories and post List */}
      <div className="w-full min-w-0 max-w-full flex-1">
        <StoriesBar />

        {/* List of Posts */}
        <div className="space-y-4 px-3 pb-6 sm:space-y-6 sm:px-4 md:px-6">
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden w-full min-w-0 max-w-sm shrink-0 md:block">
        <div className="sticky top-4 space-y-6">
          <div className="hidden max-w-xs flex-col gap-2 rounded-md bg-white p-4 text-xs shadow xl:inline-flex dark:bg-slate-900 dark:text-slate-200">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Sponsored</h3>
            <img className="h-50 w-75 rounded-md" alt="" src={assets.sponsored_img} />
            <p className="text-slate-600 dark:text-slate-300">Email marketing</p>
            <p className="text-slate-400 dark:text-slate-500">
              Supercharge your marketing with a powerful, easy-to-use platform built for results.
            </p>
          </div>
          <RecentMessages />
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default Feed