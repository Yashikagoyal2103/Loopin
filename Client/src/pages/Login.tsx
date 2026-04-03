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
            } else {
                await signup(email, password, fullName, username);
                toast.success('Account created!');
            }
            navigate('/');
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <img src={assets.bgImage} alt="" className="absolute top-0 left-0 -z-10 w-full h-full object-cover" />
            <div className="flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40">
                <div className="flex h-11 items-center">
                    <img
                        src={assets.logo}
                        alt="Loopin"
                        className="h-9 w-auto max-w-[180px] object-contain object-left opacity-[0.92] dark:opacity-[0.9] dark:brightness-110"
                    />
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-4 max-md:mt-10">
                        <img src={assets.group_users} alt="" className="h-8 md:h-10" />
                        <div>
                            <div className="flex">
                                {Array(5)
                                    .fill(0)
                                    .map((_, i) => (
                                        <Star key={i} className="size-4 text-transparent fill-amber-500" />
                                    ))}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300">Used by 15k+ developers</p>
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-6xl md:pb-2 font-bold text-transparent bg-gradient-to-r from-indigo-950 to-indigo-800 bg-clip-text dark:from-indigo-100 dark:to-indigo-300">
                        Connect. Share. Thrive.
                    </h1>
                    <p className="text-xl md:text-2xl text-indigo-900 max-w-72 md:max-w-md dark:text-slate-200">
                        Join LoopIn — connecting you to a thriving global community.
                    </p>
                </div>
                <span className="md:h-10" />
            </div>
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:pr-40">
                <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 dark:bg-slate-800/95 dark:border dark:border-slate-600">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center dark:text-slate-100">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="Full Name"
                                />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="Username (optional)"
                                />
                            </>
                        )}
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="you@example.com"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="********"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg disabled:opacity-60"
                        >
                            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
                        </button>
                    </form>
                    <button
                        type="button"
                        onClick={() => (window.location.href = `${API_BASE_URL}/api/auth/google`)}
                        className="w-full mt-4 border py-2 rounded-lg dark:border-slate-500 dark:text-slate-200"
                    >
                        Continue with Google
                    </button>
                    <p className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400">
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-indigo-600 font-medium dark:text-indigo-400"
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
