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
            return `Cannot reach API. In dev, use the Vite dev server so /api is proxied. (${API_BASE_URL || 'same-origin'})`;
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
    cover_photo: string;
    bio: string;
    location: string;
    authProvider: 'local' | 'google' | 'facebook';
}

function normalizeUser(raw: unknown): User | null {
    if (!raw || typeof raw !== 'object') return null;
    const u = raw as Record<string, unknown>;
    const id = u._id != null ? String(u._id) : '';
    if (!id) return null;
    return {
        _id: id,
        email: String(u.email ?? ''),
        username: String(u.username ?? ''),
        full_name: String(u.full_name ?? ''),
        profile_picture: String(u.profile_picture ?? ''),
        cover_photo: String(u.cover_photo ?? u.cover_picture ?? ''),
        bio: String(u.bio ?? ''),
        location: String(u.location ?? ''),
        authProvider: (u.authProvider as User['authProvider']) || 'local'
    };
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

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await axios.get('/api/auth/me');
            if (response.data.success) {
                const normalized = normalizeUser(response.data.user);
                setUser(normalized);
            }
        } catch (error: unknown) {
            console.error('Auth check error:', authErrorMessage(error, 'Unknown error during auth check'));
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            if (response.data.success) {
                const normalized = normalizeUser(response.data.user);
                if (normalized) setUser(normalized);
                else throw new Error('Invalid user payload from server');
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
            if (!response.data.success) {
                throw new Error(response.data.message || 'Signup failed');
            }
            const normalized = normalizeUser(response.data.user);
            if (normalized) setUser(normalized);
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
            setUser(null);
            Cookies.remove('token');
            Cookies.remove('refreshToken');
        }
    };

    const refreshUser = async () => {
        try {
            const response = await axios.get('/api/auth/me');
            if (response.data.success) {
                const normalized = normalizeUser(response.data.user);
                if (normalized) setUser(normalized);
            }
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('oauth') === 'success') {
            checkAuth();
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
