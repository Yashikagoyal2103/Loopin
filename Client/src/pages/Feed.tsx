import { useEffect, useState } from 'react';
import { dummyPostsData } from '../assets/assets';
import Loading from '../components/Loading';
import { type Post } from '../assets/assets';     //type is written to separate value import from interface/type import
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard'


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
        <div >
          <h1>Sponsored</h1>
        </div>
        <h1> Recent messages </h1>
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default Feed