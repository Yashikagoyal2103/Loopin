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
    <div className="min-h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 md:min-h-0 md:h-full md:overflow-y-auto">
      <div className="mx-auto max-w-6xl px-3 py-4 md:p-6">
        {/* Title */}
        <div className="mb-4 md:mb-8">
          <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-slate-100 md:mb-2 md:text-3xl">Discover People</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 md:text-base">
            Connect with amazing people and grow your network
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-xl border border-slate-200/60 bg-white/90 shadow-md dark:border-slate-700 dark:bg-slate-900/80 md:mb-8">
          <div className="p-4 md:p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyUp={handleSearch}
                placeholder="Search by name, username, bio, or location..."
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-base text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 sm:pl-12 md:py-2 md:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:gap-3">
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