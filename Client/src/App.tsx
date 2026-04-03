import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import Connections from './pages/Connections'
import ChatBox from './pages/ChatBox'
import CreatePost from './pages/CreatePost'
import Profile from './pages/Profile'
import Discover from './pages/Discover'
import { useAuth } from './context/AuthContext'
import Layout from './pages/Layout'
import { useDispatch } from 'react-redux'
import { clearUser, fetchUser } from './features/user/userSlice'
import type { AppDispatch } from './app/store'
import { clearConnections, fetchConnections } from './features/connections/connectionsSlice'
import { Toaster } from 'react-hot-toast'
import Loading from './components/Loading'
import { resetMessages } from './features/messages/messagesSlice'

const App = () => {
  const { user, loading } = useAuth()
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('loopin-theme') === 'dark');

  const dispatch = useDispatch<AppDispatch>();


  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('loopin-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (user) {
      dispatch(fetchUser());
      dispatch(fetchConnections());
    } else {
      // Prevent stale state when switching accounts or logging out.
      dispatch(clearUser());
      dispatch(clearConnections());
      dispatch(resetMessages());
    }
  }, [user, dispatch]);

  if (loading) {
    return <Loading />
  }

  return (
    <>
      <Toaster/>
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/' element={!user ? <Login/> : <Layout darkMode={darkMode} setDarkMode={setDarkMode} />}>
          <Route index element={<Feed/>}/>
          <Route path='/messages' element={<Messages/>}/>
          <Route path='/messages/:userId' element={<ChatBox/>}/>
          <Route path='/connections' element={<Connections/>}/>
          <Route path='/create-post' element={<CreatePost/>}/>
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/profile/:profileId' element={<Profile/>}/>
          <Route path='/discover' element={<Discover/>}/>
        </Route>
      </Routes>
    </>
  )
}

export default App



