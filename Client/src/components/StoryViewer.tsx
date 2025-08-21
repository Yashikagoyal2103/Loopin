import { BadgeCheck, X } from "lucide-react"
import {type Story} from "../assets/assets";
import { useEffect, useState } from "react";

interface props {
  viewStory: Story;
  setViewStory: (story: Story | null) => void;
}
const StoryViewer = ({viewStory, setViewStory}:props) => {

  const [progress , setProgress] = useState(0);

  useEffect(() => {

    let timer: number =0 ;
    const progressInterval: number =0 ;

    if(viewStory && viewStory.media_type !== 'video') {
      setProgress(0);

      const duration  =10000;
      const setTime= 100;
      let elapsed =0;

      setInterval(() => {
        elapsed+= setTime;
        setProgress((elapsed / duration ) * 100)
      }, setTime);

      // Close story after duration
      timer = setTimeout(() => {
        setViewStory(null);
      }, duration )
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    }
  },[viewStory, setViewStory])

  const handleClose = () => {
    setViewStory(null);
  }

  const renderContent = () => {
    switch (viewStory.media_type) {
      case 'image':  
        return (
          <img src={viewStory.media_url} alt='image' className="max-w-full max-h-screen object-contain" />
        );
        case 'video':  
        return (
          <video onEnded={() => setViewStory(null)} src={viewStory.media_url} className=" max-h-screen" controls autoPlay />
        );
        case 'text':  
        return (
          <div className="w-full h-full flex items-center justify-center text-white text-2xl text-center p-8">
            {viewStory.content }
          </div>
        );

        default:
        return null;
  }}

  return (
    <div className="fixed inset-0 h-screen z-110 flex items-center justify-center bg-black bg-opacity-90" 
    style={{backgroundColor: viewStory.media_type === 'text' ? viewStory.background_color: '#000000'}}>

      {/* Progress Bar */}
      <div className='absolute top-0 left-0 w-full h-1 bg-gray-700 '>
        <div className="h-full bg-white transition-all duration-100 linear" style={{width: `${progress}%`}}>
        </div>
      </div>

      {/* User info top left */}
      <div className="absolute top-4 left-4 flex items-center  space-x-3 p-2 px-4 sm:p-4 sm:px-6 rounded bg-white/50 backdrop-blur-2xl ">
        <img src={viewStory.user.profile_picture} alt="User" className="size-7 sm:size-8 rounded-full object-cover border border-white " />
        <div className=" text-white gap-1.5 font-medium flex items-center">
          <span > {viewStory.user?.full_name}</span>
          <BadgeCheck size={18}/>
        </div>
      </div>    

        {/* Close Button  */}
        <button onClick={handleClose} className="absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none" 
        aria-label="Close" type='button' >
          <X className='w-8 h-8 hover:scale-110 transition cursor-pointer'/>
        </button>

        {/* Content Wrapper */}
        <div className=" max-w-[90vw] max-h-[90vh] flex items-center justify-center">
          {renderContent()} 

        </div>
    </div>
  )
}

export default StoryViewer