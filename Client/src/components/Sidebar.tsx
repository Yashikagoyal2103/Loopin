import { assets } from '../assets/assets'
import { useNavigate, Link } from 'react-router-dom'
import MenuItems from './MenuItems'
import { CirclePlus, LogOut, Moon, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { RootState } from '../app/store'
import { useSelector } from 'react-redux'

interface Props {
  darkMode: boolean
  setDarkMode: (value: boolean) => void
}

const Sidebar = ({ darkMode, setDarkMode }: Props) => {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.user.value)
  const { logout } = useAuth()

  return (
    <div className="flex h-full w-60 flex-col items-center justify-between border-r border-gray-200 bg-white xl:w-72 dark:border-slate-700 dark:bg-slate-900">
      <div className="w-full">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="ml-6 my-2 flex h-10 w-auto max-w-[140px] items-center justify-start rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
        >
          <img
            src={assets.logo}
            alt="Loopin"
            className="h-12 w-auto object-contain object-left opacity-90 md:h-14 lg:h-14 dark:opacity-[0.88] dark:brightness-110 dark:contrast-95"
          />
        </button>
        <hr className="mb-8 border-gray-300 dark:border-slate-700" />

        <MenuItems />

        <Link
          to="/create-post"
          className="mx-6 mt-6 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 py-2.5
        text-white transition hover:from-indigo-700 hover:to-purple-800 active:scale-95"
        >
          <CirclePlus className="h-5 w-5" />
          Create Post
        </Link>
      </div>

      <div className="flex w-full items-center justify-between border-t border-gray-200 p-4 px-7 dark:border-slate-700">
        <div className="flex cursor-pointer items-center gap-2">
          <img
            src={user?.profile_picture || assets.sample_profile}
            alt="avatar"
            className="size-9 rounded-full object-cover"
          />
          <div>
            <h1 className="text-sm font-medium text-slate-900 dark:text-slate-100"> {user?.full_name || 'User'} </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400"> @{user?.username || 'username'} </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            title="Toggle dark mode"
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="cursor-pointer text-gray-500 transition hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-100"
          >
            {darkMode ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          <LogOut
            onClick={async () => {
              try {
                await logout()
                navigate('/')
              } catch (error) {
                console.error('Sign out failed:', error)
              }
            }}
            className="h-[18px] w-[18px] cursor-pointer text-gray-400 transition hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-200"
          />
        </div>
      </div>
    </div>
  )
}

export default Sidebar
