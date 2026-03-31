import { assets } from '../assets/assets'
import { useNavigate , Link } from 'react-router-dom'
import MenuItems from './MenuItems'
import { CirclePlus, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { RootState } from '../app/store'
import { useSelector } from 'react-redux'

interface Props {
  sidebarOpen: boolean;  // Explicitly type the prop
  setSidebarOpen: (value: boolean) => void;
}
const Sidebar = ({ sidebarOpen , setSidebarOpen }:Props) => {

  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.value);
  const { logout } = useAuth()

  return (
    <div className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-center 
    max-sm:absolute top-0 bottom-0 z-20 ${sidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
      <div className="w-full">
        <img onClick={() => navigate('/')} src={assets.logo} alt="Logo" className="w-14 ml-7 my-2 cursor-pointer" />
        <hr className='border-gray-300 mb-8' /> 

        <MenuItems setSidebarOpen={setSidebarOpen}/>

        <Link to='/create-post' className="flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg
        bg-gradient-to-r from-indigo-500 to-purple-600 text-white  hover:from-indigo-700  hover:to-purple-800 
        transition cursor-pointer active:scale-95">
          <CirclePlus className="w-5 h-5"/>
          Create Post
        </Link>
      </div>

      <div className='w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between'>
        <div className='flex gap-2 items-center cursor-pointer'>
          <img src={user?.profile_picture || assets.sample_profile} alt='avatar' className='size-9 rounded-full object-cover' />
          <div >
            <h1 className='text-sm font-medium'> {user?.full_name || 'User'} </h1>
            <p className='text-xs text-gray-500'> @{user?.username || 'username'} </p>
          </div>
        </div>
        <LogOut 
          onClick={async () => {
            try {
              await logout();
              navigate('/');
            } catch (error) {
              console.error('Sign out failed:', error);
            }
          }} 
          className='w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer'
        />
      </div> 
    </div>
  )
}

export default Sidebar