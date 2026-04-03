import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useState } from 'react'
import { X , Menu } from 'lucide-react'
// import { dummyUserData } from '../assets/assets'
import Loading from '../components/Loading'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'

interface LayoutProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const Layout = ({ darkMode, setDarkMode }: LayoutProps) => {

  const user = useSelector((state: RootState) => state.user.value);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

  return user ? (
    <div className="w-full flex h-screen">

      <Sidebar sidebarOpen= {sidebarOpen} setSidebarOpen={setSidebarOpen} darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="flex-1 bg-slate-50">
        {/* This is where the main content will be rendered */}
        <Outlet />
      </div>
      
      { sidebarOpen ?

        <X className="absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden " 
        onClick={() => setSidebarOpen(false)} />
        :
        <Menu className="absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden" 
        onClick={() => setSidebarOpen(true)} />

      } 
    </div>

  ) : (
    <Loading />
  )
}

export default Layout