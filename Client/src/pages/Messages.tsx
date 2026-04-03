import { useMemo, useState } from 'react'
import { Eye, MessageSquare, Search } from 'lucide-react'
import { type User } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '../app/store'
import { useSelector } from 'react-redux'

const Messages = () => {
  const { connections, following } = useSelector((state: RootState) => state.connections)
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  const usersMap = new Map<string, User>()
  ;[...connections, ...following].forEach((u: User) => {
    if (u?._id) usersMap.set(u._id, u)
  })
  const users = Array.from(usersMap.values())

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return users
    return users.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(s) ||
        u.username?.toLowerCase().includes(s) ||
        u.bio?.toLowerCase().includes(s)
    )
  }, [users, q])

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 md:min-h-0 md:h-full md:overflow-y-auto">
      <div className="mx-auto max-w-6xl px-3 py-4 md:p-6">
        <div className="mb-6 hidden md:block">
          <h1 className="mb-1 text-3xl font-bold text-slate-900 dark:text-slate-100">Messages</h1>
          <p className="text-slate-600 dark:text-slate-400">Talk to your friends and family</p>
        </div>

        <div className="relative mb-4 md:mb-8">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-base text-slate-900 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 md:text-sm"
          />
        </div>

        <div className="flex flex-col gap-3">
          {users.length === 0 && (
            <div className="max-w-xl rounded-xl bg-white p-6 text-slate-600 shadow dark:bg-slate-900 dark:text-slate-400">
              No users to message yet. Follow or connect with people from Discover or Connections.
            </div>
          )}

          {filtered.map((user: User) => (
            <div
              key={user._id}
              className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:max-w-xl md:flex-nowrap md:gap-5 md:p-6"
            >
              <img
                src={user.profile_picture}
                alt=""
                className="size-12 shrink-0 rounded-full object-cover md:mx-0"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-800 dark:text-slate-100">{user.full_name}</p>
                <p className="truncate text-slate-500 dark:text-slate-400">@{user.username}</p>
                {user.bio ? (
                  <p className="mt-0.5 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{user.bio}</p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col gap-2 md:flex-row">
                <button
                  onClick={() => navigate(`/messages/${user._id}`)}
                  type="button"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-800 transition hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  aria-label={`Open chat with ${user.full_name}`}
                >
                  <MessageSquare className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-800 transition hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  aria-label={`View ${user.full_name} profile`}
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {users.length > 0 && filtered.length === 0 && (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">No matches for your search.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages
