import { useState, useRef, useEffect } from 'react'
import { type User } from '../assets/assets'
import { ArrowLeft, ImageIcon, SendHorizonal } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../app/store'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { addMessage, fetchMessages, resetMessages } from '../features/messages/messagesSlice'

interface Message {
  _id: string
  to_user_id: string
  text: string
  message_type: string
  media_url?: string
  createdAt: string
}

const ChatBox = () => {
  const { messages } = useSelector((state: RootState) => state.messages)
  const { userId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const [text, setText] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const messageEndRef = useRef<HTMLDivElement>(null)

  const { connections, following } = useSelector((state: RootState) => state.connections)

  const fetchUserMessages = async () => {
    try {
      if (!userId) {
        toast.error('No user selected for messaging')
        return
      }
      dispatch(fetchMessages({ userId }))
    } catch (error: unknown) {
      toast.error((error as Error).message)
    }
  }

  const sendMessage = async () => {
    try {
      if (!text && !image) return
      if (!userId) {
        toast.error('No user selected for messaging')
        return
      }

      const formData = new FormData()
      formData.append('to_user_id', userId)
      formData.append('text', text)
      if (image) {
        formData.append('image', image)
      }

      const { data } = await api.post('/api/message/send', formData)
      if (data.success) {
        setText('')
        setImage(null)
        dispatch(addMessage(data.message))
      } else {
        throw new Error(data.message || 'Failed to send message')
      }
    } catch (error: unknown) {
      toast.error((error as Error).message)
    }
  }

  useEffect(() => {
    fetchUserMessages()

    return () => {
      dispatch(resetMessages())
    }
  }, [userId])

  useEffect(() => {
    if (!userId) {
      setUser(null)
      return
    }
    const usersMap = new Map<string, User>()
    ;[...connections, ...following].forEach((u: User) => {
      if (u?._id) usersMap.set(u._id, u)
    })
    setUser(usersMap.get(userId) || null)
  }, [connections, following, userId])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <p className="text-center text-gray-500 dark:text-slate-400">Select a user to start chatting</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-2 py-2 dark:border-slate-700 dark:from-slate-900 dark:to-slate-900 md:px-10 xl:pl-42">
        <button
          type="button"
          onClick={() => navigate('/messages')}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-slate-700 hover:bg-white/60 md:hidden dark:text-slate-200"
          aria-label="Back to messages"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <img src={user.profile_picture} className="size-9 shrink-0 rounded-full object-cover md:size-8" alt="" />
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900 dark:text-slate-100">{user.full_name}</p>
          <p className="-mt-0.5 truncate text-sm text-gray-500 dark:text-slate-400">@{user.username}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 md:p-5 md:px-10">
        <div className="mx-auto max-w-4xl space-y-3">
          {messages
            .slice()
            .sort(
              (a: Message, b: Message) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
            .map((message: Message, index: number) => {
              const incoming = message.to_user_id !== user._id
              return (
                <div
                  key={message._id || index}
                  className={`flex flex-col ${incoming ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-base shadow-sm sm:max-w-sm md:text-sm ${
                      incoming
                        ? 'rounded-bl-md bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                        : 'rounded-br-md bg-indigo-600 text-white dark:bg-indigo-500'
                    }`}
                  >
                    {message.message_type === 'image' && message.media_url && (
                      <img
                        src={message.media_url}
                        className="mb-2 w-full max-w-sm rounded-lg"
                        alt=""
                      />
                    )}
                    {message.text ? <p>{message.text}</p> : null}
                  </div>
                </div>
              )
            })}
          <div ref={messageEndRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-gray-200 bg-white px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] dark:border-slate-700 dark:bg-slate-900 md:px-4 md:pb-3">
        <div className="mx-auto flex max-w-xl items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-3 pr-1 shadow-sm dark:border-slate-600 dark:bg-slate-800">
          <input
            type="text"
            placeholder="Message..."
            onKeyDown={(e) => e.key === 'Enter' && void sendMessage()}
            className="min-h-11 flex-1 bg-transparent text-base text-slate-800 outline-none dark:text-slate-100 md:text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <label htmlFor="chat-image" className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center">
            {image ? (
              <img src={URL.createObjectURL(image)} className="h-9 rounded-md object-cover" alt="" />
            ) : (
              <ImageIcon className="size-7 text-gray-400" />
            )}
            <input
              type="file"
              id="chat-image"
              accept="image/*"
              hidden
              onChange={(e) => {
                const files = e.target.files
                if (files?.[0]) setImage(files[0])
              }}
            />
          </label>

          <button
            type="button"
            onClick={() => void sendMessage()}
            aria-label="Send"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 text-white hover:from-indigo-700 hover:to-purple-800 active:scale-95"
          >
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBox
