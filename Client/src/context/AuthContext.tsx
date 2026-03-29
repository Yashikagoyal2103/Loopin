import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios, { isAxiosError } from 'axios';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../config/api';

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

function authErrorMessage(error: unknown, fallback: string): string {
    if (isAxiosError(error)) {
        const data = error.response?.data as { message?: string } | undefined;
        if (typeof data?.message === 'string') return data.message;
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            return `Cannot reach API at ${API_BASE_URL}. Is the server running? If the app URL uses 127.0.0.1, the server CORS must allow it (we allow localhost and 127.0.0.1 in dev).`;
        }
        if (error.response?.status === 0) {
            return 'Request blocked (often CORS). Open DevTools → Network and check the failed request.';
        }
    }
    if (error instanceof Error) return error.message;
    return fallback;
}

interface User {
    _id: string;
    email: string;
    username: string;
    full_name: string;
    profile_picture: string;
    cover_picture: string;
    bio: string;
    location: string;
    authProvider: 'local' | 'google' | 'facebook';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, full_name: string, username?: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if user is authenticated on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await axios.get('/api/auth/me');
            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            if (response.data.success) {
                setUser(response.data.user);
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error: unknown) {
            throw new Error(authErrorMessage(error, 'Login failed'));
        }
    };

    const signup = async (email: string, password: string, full_name: string, username?: string) => {
        try {
            const response = await axios.post('/api/auth/signup', {
                email,
                password,
                full_name,
                username
            });
            if (response.data.success) {
                setUser(response.data.user);
            } else {
                throw new Error(response.data.message || 'Signup failed');
            }
        } catch (error: unknown) {
            throw new Error(authErrorMessage(error, 'Signup failed'));
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
            setUser(null);
            Cookies.remove('token');
            Cookies.remove('refreshToken');
        } catch (error) {
            console.error('Logout error:', error);
            // Clear user even if API call fails
            setUser(null);
            Cookies.remove('token');
            Cookies.remove('refreshToken');
        }
    };

    const refreshUser = async () => {
        try {
            const response = await axios.get('/api/auth/me');
            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
    };

    // Handle OAuth success from URL params
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('oauth') === 'success') {
            checkAuth();
            // Clean up URL
            window.history.replaceState({}, document.title, '/');
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
