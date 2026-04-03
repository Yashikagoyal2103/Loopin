import { Home, MessageCircle, Search, Users } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../app/store'
import { assets } from '../../assets/assets'

const MobileBottomNav = () => {
  const { pathname } = useLocation()
  const user = useSelector((state: RootState) => state.user.value)

  const isActivePath = (to: string, end?: boolean): boolean => {
    if (to === '/messages') return pathname === '/messages' || pathname.startsWith('/messages/')
    if (to === '/connections') return pathname === '/connections'
    if (to === '/profile') return pathname === '/profile' || pathname.startsWith('/profile/')
    if (end) return pathname === '/'
    return pathname.startsWith(to)
  }

  const profileActive = isActivePath('/profile')

  const items: { to: string; end?: boolean; icon: typeof Home; label: string }[] = [
    { to: '/', end: true, icon: Home, label: 'Feed' },
    { to: '/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/discover', icon: Search, label: 'Discover' },
    { to: '/connections', icon: Users, label: 'Connections' }
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[55] flex h-[calc(3.75rem+env(safe-area-inset-bottom))] items-start justify-around border-t border-slate-200 bg-white pt-1 shadow-[0_-4px_24px_-4px_rgba(15,23,42,0.12)] md:hidden dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.35)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary"
    >
      {items.map(({ to, end, icon: Icon, label }) => {
        const active = isActivePath(to, end)
        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={`flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 ${
              active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
            }`}
            aria-label={label}
          >
            <Icon className={`h-6 w-6 ${active ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
          </NavLink>
        )
      })}

      <NavLink
        to="/profile"
        className={`flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center rounded-lg px-1 ${
          profileActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
        }`}
        aria-label="Profile"
      >
        <img
          src={user?.profile_picture || assets.sample_profile}
          alt=""
          className={`h-8 w-8 rounded-full object-cover ${
            profileActive ? 'ring-2 ring-indigo-600 ring-offset-2 dark:ring-indigo-400 dark:ring-offset-slate-900' : ''
          }`}
        />
      </NavLink>
    </nav>
  )
}

export default MobileBottomNav
