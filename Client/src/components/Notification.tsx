import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

// message type
interface MessageUser {
  _id: string;
  full_name: string;
  profile_picture?: string;
}

interface NotificationMessage {
  from_user_id: MessageUser;
  text: string;
}

interface Toast {
  id: string;
}

interface NotificationProps {
  t: Toast;
  message: NotificationMessage;
}
const Notification = ({t, message}:NotificationProps ) => {
    const navigate = useNavigate()

  return (
    <div className= {`max-w-md w-full bg-white shadow-lg rounded-lg flex border border-gray-300
    hover:scale-150 transition`}>
        <div className='flex p-4'>
            <div className='flex-1 item-start'>
            <img src={message.from_user_id.profile_picture} alt="" className='h-10 w-10 rounded-full flex-shrink-0 mt-0.5' />
            <div className='ml-3 flex-1'>
                <p className='text-sm font-medium text-gray-900'>
                    {message.from_user_id.full_name}
                </p>
                <p className=' text-sm text-gray-500'>
                    {message.text.slice(0,50)}
                </p>
            </div>
        </div>
        </div>
        <div className='flex border-1 border-gray-200'>
            <button onClick={() => {
                navigate(`/messages/${message.from_user_id._id}`);
                toast.dismiss(t.id)
            }} className='p-4 text-indigo-600 font-semibold'>
                Reply
            </button>
        </div>
    </div>
    
  )
}

export default Notification