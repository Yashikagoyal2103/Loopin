import { ArrowLeft, Sparkle, TextIcon, Upload } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface StoryModelProps {
    setShowModel: (show: boolean) => void;
    fetchStories: () => void; 
}
const StoryModel = ({ setShowModel, fetchStories }: StoryModelProps) => {

    const bgColors = [ "#FFFFFF" , "#CED4DA" , "#ADB5BD" , "#6C757D" , "#495057" , "#343A40" , "#212529" ,"#FF6B6B" , "#FA5252" , "#E03131" , "#C92A2A" , "#A51111" ,
       "#339AF0" , "#228BE6" , "#1C7ED6" , "#1971C2" , "#1864AB" , "#40C057" ,  "#237032" , "#FCC419"  , "#F59F00" , "#E67700" , "#D9480F" , "#BE4BDB" ,  "#702C8A" ,
       "#FD7E14" , "#F76707" , "#E8590C" , "#D9480F" , "#22B8CF"  , "#1098AD" , "#0B7285" , "#FFA8A8"  , "#D8F5A2" , "#99E9F2"  , "#D0BFFF" , "#E9ECEF" ,
        "#F8F9FA" , "#EBFBEE" , "#212529" , "#343A40" , "#495057" , "#6C757D" , "#868E96"  , "#ADB5BD" , "#CED4DA" , "#DEE2E6" ];

    const [mode , setMode] = useState<string>('text');
    const [background, setBackground] = useState<string>(bgColors[0]);
    const [text, setText] = useState<string>('');
    const [media, setMedia] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string|null>(null);

    const MAX_VIDEO_DURATION=60;
    const MAX_VIDEO_SIZE_MB= 50;
    const handleMediaUpload = (e : React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if(file) {
         if(file){
          if(file.type.startsWith('video')){
            if(file.size > MAX_VIDEO_SIZE_MB * 1024*1024){
              toast.error(`Video file size connot exceed ${MAX_VIDEO_SIZE_MB} MB.`)
              setMedia(null)
              setPreviewUrl(null)
              return;
            }
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
              window.URL.revokeObjectURL(video.src)
              if(video.duration > MAX_VIDEO_DURATION){
                toast.error("Video duration cannot exceed 1 minute")
                setMedia(null)
                setPreviewUrl(null)
              }else{
                setMedia(file)
                setPreviewUrl(URL.createObjectURL(file))
                setText('')
                setMode('media')
              }
            }
            video.src = URL.createObjectURL(file)
          }else if(file.type.startsWith('image')){
            setMedia(file)
            setPreviewUrl(URL.createObjectURL(file))
            setText('')
                setMode('media')
          }
         }
      }
    }

    const handleCreateStory = async () =>{
      const media_type = mode === 'media'
        ? (media?.type.startsWith('image') ? 'image' : 'video')
        : 'text';

      if(media_type === 'text' && !text){
        throw new Error("Please enter text")
      }

      const formData = new FormData();
      formData.append('content', text);
      formData.append('media_type', media_type);
      if (media) {
        formData.append('media', media);
      }
      formData.append('background_color', background);

      try{
        const { data} = await api.post('/api/story/create', formData)

        if(data.success){
          setShowModel(false)
          toast.success("Story Created Successfully")
          fetchStories()
        }else{
          toast.error(data.message)
        }
      }catch (error :unknown){
        toast.error((error as Error).message)
      }
    }
  return (
    <div className="fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4" >
      <div className="w-full max-w-md">
        <div className="text-center mb-4 flex items-center justify-between">
          <button onClick={() => setShowModel(false)} className="text-white p-2 cursor-pointer" title="story" type='button' >
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">Create Story</h2>
          <span className="w-10"></span>
        </div>
        
        <div className="rounded-lg h-96 flex items-center justify-center relative" style={{background: background}}>
          {
            mode === 'text' && (
              <textarea name="" placeholder="What's on your mind?" className="bg-transparent text-white w-full h-full p-6 text-lg resize-none focus:outline-none"
               onChange={(e) => setText(e.target.value)} value={text}  />
            )
          }
          {
            mode === 'media' && previewUrl && (
              media?.type.startsWith('image') ? (
                <img src={previewUrl} alt='' className='object-contain max-h-full'/>
              ):(
                <video src={previewUrl} className="object-contain max-h-full"/>
              )
            )
          }
        </div>

        <div className="flex mt-4 gap-3 overflow-x-auto scrollbar-hide py-3 px-1">
          {
            bgColors.map((color) => (
              <button 
                key={color} 
                className={`min-w-7 min-h-7 w-7 h-7 rounded-full cursor-pointer transition-all duration-200 flex-shrink-0 ${
                  background === color 
                    ? 'ring-4 ring-white ring-offset-2 ring-offset-gray-800 shadow-lg' 
                    : 'ring-2 ring-gray-300 hover:ring-gray-100'
                }`} 
                style={{background: color}}  
                onClick={() => setBackground(color)} 
                aria-label={`Select ${color} color`}
              />
            ))
          }
        </div>

        <div className="flex gap-2 mt-4 ">
          <button onClick={() => {setMode('text'); setMedia(null); setPreviewUrl(null)}} className={`flex-1 flex items-center justify-center gap-2 p-2
            rounded ${ mode === 'text' ? "bg-white text-black" : "bg-zinc-800"}`}>
            <TextIcon size={18} /> Text
          </button>
          <label className="flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer bg-zinc-800">
            <input onChange={handleMediaUpload} accept="image/*, video/*" className="hidden" type="file" />
              <Upload size={18} /> Photo/Video
          </label>
        </div>

        <button onClick={() => toast.promise(handleCreateStory(), {
          loading:'Saving...',
          })} className="flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded bg-gradient-to-r from-indigo-500 to-purple-600
         hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition cursor-pointer">
          <Sparkle size={18} /> Create Story
        </button>


      </div>
    </div>
  )
}

export default StoryModel

