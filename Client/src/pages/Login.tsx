import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { assets } from '../assets/assets';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
                toast.success('Login successful!');
                navigate('/');
            } else {
                await signup(email, password, fullName, username);
                toast.success('Account created successfully!');
                navigate('/');
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || 'An error occurred');
            } else {
                toast.error('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_BASE_URL}/api/auth/google`;
    };

    return (
        <div className='min-h-screen flex flex-col md:flex-row'>
            {/* Background Image */}
            <img
                src={assets.bgImage}
                alt='Bg Image'
                className='absolute top-0 left-0 -z-10 w-full h-full object-cover'
            />

            {/* Left side: branding */}
            <div className='flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40'>
                <img src={assets.logo} alt='Logo' className='h-12 object-contain' />
                <div>
                    <div className='flex items-center gap-3 mb-4 max-md:mt-10'>
                        <img src={assets.group_users} alt='grp_users' className='h-8 md:h-10' />
                        <div>
                            <div className='flex'>
                                {Array(5)
                                    .fill(0)
                                    .map((_, i) => (
                                        <Star
                                            key={i}
                                            className='size-4 md:size-4.5 text-transparent fill-amber-500'
                                        />
                                    ))}
                            </div>
                            <p>Used by 15k+ developers</p>
                        </div>
                    </div>

                    <h1 className='text-3xl md:text-6xl md:pb-2 font-bold text-transparent bg-gradient-to-r from-indigo-950 to-indigo-800 bg-clip-text'>
                        Connect. Share. Thrive.
                    </h1>
                    <p className='text-xl md:text-2xl text-indigo-900 max-w-72 md:max-w-md'>
                        Join LoopIn—Connecting You to a Thriving Global Community.
                    </p>
                </div>
                <span className='md:h-10'></span>
            </div>

            {/* Right side: Auth form */}
            <div className='flex-1 flex items-center justify-center p-6 sm:p-10 lg:pr-40'>
                <div className='w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8'>
                    <h2 className='text-2xl font-bold text-gray-800 mb-6 text-center'>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>

                    <form onSubmit={handleSubmit} className='space-y-4'>
                        {!isLogin && (
                            <>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Full Name
                                    </label>
                                    <input
                                        type='text'
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required={!isLogin}
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                                        placeholder='John Doe'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Username (optional)
                                    </label>
                                    <input
                                        type='text'
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                                        placeholder='johndoe'
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Email
                            </label>
                            <input
                                type='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                                placeholder='you@example.com'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Password
                            </label>
                            <input
                                type='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                                placeholder='••••••••'
                            />
                        </div>

                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
                        </button>
                    </form>

                    <div className='mt-6'>
                        <div className='relative'>
                            <div className='absolute inset-0 flex items-center'>
                                <div className='w-full border-t border-gray-300'></div>
                            </div>
                            <div className='relative flex justify-center text-sm'>
                                <span className='px-2 bg-white text-gray-500'>Or continue with</span>
                            </div>
                        </div>

                        <div className='mt-6'>
                            <button
                                onClick={handleGoogleLogin}
                                className='w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'
                            >
                                <svg className='w-5 h-5' viewBox='0 0 24 24'>
                                    <path
                                        fill='#4285F4'
                                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                                    />
                                    <path
                                        fill='#34A853'
                                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                                    />
                                    <path
                                        fill='#FBBC05'
                                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                                    />
                                    <path
                                        fill='#EA4335'
                                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                                    />
                                </svg>
                                <span className='ml-2'>Continue with Google</span>
                            </button>
                        </div>
                    </div>

                    <p className='mt-6 text-center text-sm text-gray-600'>
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setEmail('');
                                setPassword('');
                                setFullName('');
                                setUsername('');
                            }}
                            className='text-indigo-600 hover:text-indigo-700 font-medium'
                        >
                            {isLogin ? 'Sign up' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
