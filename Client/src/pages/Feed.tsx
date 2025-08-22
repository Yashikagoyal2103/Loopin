import { useEffect, useState } from 'react';
import { dummyPostsData } from '../assets/assets';
import Loading from '../components/Loading';
import { type Post } from '../assets/assets';     //type is written to separate value import from interface/type import
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard'
import RecentMessages from '../components/RecentMessages';
import {assets} from '../assets/assets';


const Feed = () => {
  const [feeds, setFeeds] = useState<Post[]>([]);
  const [ loading , setLoading ] = useState<boolean>(true);

  const fetchFeeds = async () => {
    setFeeds(dummyPostsData)
    setLoading(false)
  }

  useEffect(()=> {
    fetchFeeds()
  },[])

  return !loading ? (
    <div className='h-full overflow-y-scroll no-scrollbar py010 xl:pr-5 flex items-start justify-center xl:gap-8'>
      {/* Stories and post List */}
      <div>
        <StoriesBar />

        {/* List of Posts */}
        <div className='p-4 space-y-6' >
          {feeds.map((post) => (
            <PostCard key={post._id} post={post}/>
          ))} 

         </div>
      </div>

      {/* Right Sidebar */}
      <div>
          <div className="max-xl:hidden sticky top-4">
            <div className="max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow">
              <h3 className="text-slate-800  font-semibold">Sponsored</h3>
              <img className="w-75 h-50 rounded-md" alt="" src={assets.sponsored_img} />
              <p className="text-slate-600">Email marketing</p>
              <p className="text-slate-400">Supercharge your marketing with a powerful, easy-to-use platform built for results.</p>
            </div>
          </div>

        <RecentMessages />
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default Feed