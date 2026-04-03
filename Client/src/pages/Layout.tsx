import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useEffect, useRef, useState } from 'react'
import Loading from '../components/Loading'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'
import MobileHeader from '../components/mobile/MobileHeader'
import MobileBottomNav from '../components/mobile/MobileBottomNav'
import MobileDrawer from '../components/mobile/MobileDrawer'
import MobileSearchOverlay from '../components/mobile/MobileSearchOverlay'

interface LayoutProps {
  darkMode: boolean
  setDarkMode: (value: boolean) => void
}

const chatThreadPattern = /^\/messages\/[^/]+$/

const Layout = ({ darkMode, setDarkMode }: LayoutProps) => {
  const user = useSelector((state: RootState) => state.user.value)
  const { pathname } = useLocation()
  const isChatThread = chatThreadPattern.test(pathname)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [hideHeader, setHideHeader] = useState(false)
  const lastScrollY = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isChatThread) {
      setHideHeader(false)
      return
    }
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const y = el.scrollTop
      const prev = lastScrollY.current
      const delta = y - prev
      lastScrollY.current = y
      if (y <= 72) {
        setHideHeader(false)
        return
      }
      if (delta > 6) setHideHeader(true)
      else if (delta < -6) setHideHeader(false)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [isChatThread, pathname])

  useEffect(() => {
    setHideHeader(false)
    lastScrollY.current = 0
  }, [pathname])

  return user ? (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 md:min-h-screen md:h-screen">
      <div className="hidden h-full shrink-0 md:block">
        <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <MobileHeader
          hide={hideHeader && !searchOpen && !drawerOpen}
          onMenu={() => setDrawerOpen(true)}
          onSearch={() => setSearchOpen(true)}
        />

        <div
          ref={isChatThread ? undefined : scrollRef}
          className={`min-h-0 flex-1 w-full md:overflow-hidden ${
            isChatThread
              ? 'flex flex-col overflow-hidden pt-14 md:pt-0'
              : 'overflow-y-auto overscroll-y-contain pt-14 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pt-0 md:pb-0'
          }`}
        >
          <Outlet />
        </div>

        <MobileBottomNav />
      </div>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <MobileSearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  ) : (
    <Loading />
  )
}

export default Layout
