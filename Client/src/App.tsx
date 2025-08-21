import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import Connections from './pages/Connections'
import ChatBox from './pages/ChatBox'
import CreatePost from './pages/CreatePost'
import Profile from './pages/Profile'
import Discover from './pages/Discover'
import { useUser } from '@clerk/clerk-react'
import Layout from './pages/Layout'
import { Toaster } from 'react-hot-toast'

const App = () => {
  const { user }= useUser()
  return (
    <>
    <Toaster/>
      <Routes>
        <Route path='/' element={!user ? <Login/> : <Layout/>}>
          <Route index element={<Feed/>}/>
          <Route path='/meassges' element={<Messages/>}/>
          <Route path='/meassges/:userId' element={<ChatBox/>}/>
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