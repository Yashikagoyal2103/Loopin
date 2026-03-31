import { useEffect, useState } from 'react'
import { type User } from '../assets/assets'
import { Search } from 'lucide-react'
import UserCard from '../components/UserCard'
import Loading from '../components/Loading'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { fetchUser } from '../features/user/userSlice'
import type { AppDispatch } from '../app/store'


const Discover = () => {

  const [input , setInput] = useState<string>('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const dispatch = useDispatch<AppDispatch>();

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key === 'Enter'){
      try{
        setUsers([])
      setLoading(true)
      const { data } = await api.post('/api/user/discover', {input})

      if(data.success){
          setUsers(data.users)
      }else{
        toast.error(data.message)
      }
      setLoading(false)
      setInput('')
      }catch( error: unknown){
        toast.error((error as Error).message)
      }
      setLoading(false)
    }
  }

  useEffect(() => {
      dispatch(fetchUser())
    },[dispatch])


  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Discover People</h1>
          <p className="text-slate-600">Connect with Amazing people and grow your network</p>
        </div>

        {/* Search */}
        <div className='mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80'>
          <div className='p-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400' />
              <input type='text' value={input} onChange={(e)=> setInput(e.target.value)} onKeyUp={handleSearch} 
              placeholder='Search by name, username, bio or location....' className='w-full pl-10 sm:pl-12 py-2 
              border border-gray-300 rounded-md max-sm:text-sm' />
            </div>
          </div>
        </div>

        <div className='flex flex-wrap gap-3'>
          {users.map((user) =>(
            <UserCard user={user} key={user._id} />
          ))}
        </div>

        {
          loading && (<Loading height='60vh' />)
        }
      </div>
    </div>
  )
}

export default Discover