import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import type { User } from '../../assets/assets'
import UserCard from '../UserCard'
import Loading from '../Loading'

type Props = {
  open: boolean
  onClose: () => void
}

const MobileSearchOverlay = ({ open, onClose }: Props) => {
  const [input, setInput] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setInput('')
      setUsers([])
      setLoading(false)
    }
  }, [open])

  if (!open) return null

  const runSearch = async () => {
    const q = input.trim()
    if (!q) {
      toast.error('Enter a search term')
      return
    }
    try {
      setLoading(true)
      setUsers([])
      const { data } = await api.post('/api/user/discover', { input: q })
      if (data.success) {
        setUsers(data.users || [])
      } else {
        toast.error(data.message)
      }
    } catch (e: unknown) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-white dark:bg-slate-900 md:hidden" role="dialog" aria-modal="true" aria-label="Search">
      <div
        className="flex items-center gap-2 border-b border-slate-200 px-2 py-2 dark:border-slate-700"
        style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
      >
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            autoFocus
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void runSearch()
            }}
            placeholder="Search people..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-base text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Close search"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <button
          type="button"
          onClick={() => void runSearch()}
          className="mb-3 w-full min-h-11 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 active:scale-[0.99]"
        >
          Search
        </button>

        {loading ? (
          <Loading height="40vh" />
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((user) => (
              <UserCard user={user} key={user._id} />
            ))}
            {!loading && users.length === 0 && input.trim() === '' && (
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">Type a name or keyword and tap Search.</p>
            )}
            {!loading && users.length === 0 && input.trim() !== '' && (
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">No users found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileSearchOverlay




