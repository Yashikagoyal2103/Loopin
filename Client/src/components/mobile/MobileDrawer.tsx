import { useEffect, useRef } from 'react'
import {
  Home,
  LogOut,
  MessageCircle,
  Moon,
  Search,
  Settings,
  Sun,
  Users,
  User as UserIcon,
  X
} from 'lucide-react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { RootState } from '../../app/store'
import { useSelector } from 'react-redux'
import { assets } from '../../assets/assets'

type Props = {
  open: boolean
  onClose: () => void
  darkMode: boolean
  setDarkMode: (v: boolean) => void
}

const MobileDrawer = ({ open, onClose, darkMode, setDarkMode }: Props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const user = useSelector((state: RootState) => state.user.value)
  const touchStartX = useRef<number | null>(null)
  const onOwnProfile = /^\/profile$/i.test(location.pathname)
  const profileHomeActive = onOwnProfile && location.hash !== '#likes'

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        aria-label="Close menu"
        onClick={onClose}
      />

      <aside
        className="absolute left-0 top-0 flex h-full w-[80%] max-w-sm flex-col bg-white shadow-2xl dark:bg-slate-900"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current
          touchStartX.current = null
          const endX = e.changedTouches[0]?.clientX
          if (start != null && endX != null && start - endX > 48) onClose()
        }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-3 py-3 dark:border-slate-700">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <img
              src={user?.profile_picture || assets.sample_profile}
              alt=""
              className="size-11 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {user?.full_name || 'User'}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">@{user?.username || 'username'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <NavLink
            to="/"
            end
            onClick={onClose}
            className={({ isActive }) =>
              `flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
              }`
            }
          >
            <Home className="h-5 w-5 shrink-0" />
            Feed
          </NavLink>
          <NavLink
            to="/messages"
            onClick={onClose}
            className={({ isActive }) =>
              `flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
              }`
            }
          >
            <MessageCircle className="h-5 w-5 shrink-0" />
            Messages
          </NavLink>
          <NavLink
            to="/discover"
            onClick={onClose}
            className={({ isActive }) =>
              `flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
              }`
            }
          >
            <Search className="h-5 w-5 shrink-0" />
            Discover
          </NavLink>
          <NavLink
            to="/connections"
            onClick={onClose}
            className={({ isActive }) =>
              `flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
              }`
            }
          >
            <Users className="h-5 w-5 shrink-0" />
            Connections
          </NavLink>
          <Link
            to="/profile"
            onClick={onClose}
            className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium ${
              profileHomeActive
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <UserIcon className="h-5 w-5 shrink-0" />
            Profile
          </Link>

          <div className="my-3 border-t border-slate-200 dark:border-slate-700" />

          <div className="flex min-h-12 items-center justify-between gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="flex items-center gap-3">
              <Settings className="h-5 w-5 shrink-0" />
              Dark mode
            </span>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-slate-700">
          <button
            type="button"
            onClick={async () => {
              try {
                await logout()
                onClose()
                navigate('/login')
              } catch (e) {
                console.error(e)
              }
            }}
            className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </div>
  )
}

export default MobileDrawer