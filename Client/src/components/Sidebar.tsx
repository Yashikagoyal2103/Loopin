import { assets } from '../assets/assets'
import { useNavigate , Link } from 'react-router-dom'
import MenuItems from './MenuItems'
import { CirclePlus, LogOut, Moon, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { RootState } from '../app/store'
import { useSelector } from 'react-redux'

interface Props {
  sidebarOpen: boolean;  // Explicitly type the prop
  setSidebarOpen: (value: boolean) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}
const Sidebar = ({ sidebarOpen , setSidebarOpen, darkMode, setDarkMode }:Props) => {

  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.value);
  const { logout } = useAuth()

  return (
    <div className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-center 
    max-sm:absolute top-0 bottom-0 z-20 ${sidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
      <div className="w-full">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="ml-6 my-2 flex h-10 w-auto max-w-[140px] items-center justify-start focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 rounded"
        >
          <img
            src={assets.logo}
            alt="Loopin"
            className="h-8 w-auto max-h-8 object-contain object-left opacity-90 dark:opacity-[0.88] dark:brightness-110 dark:contrast-95"
          />
        </button>
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
        <div className='flex items-center gap-3'>
          <button
            title='Toggle black mode'
            onClick={() => setDarkMode(!darkMode)}
            className='text-gray-500 hover:text-gray-800 transition cursor-pointer'
          >
            {darkMode ? <Sun className='w-4.5' /> : <Moon className='w-4.5' />}
          </button>
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
    </div>
  )
}

export default Sidebar