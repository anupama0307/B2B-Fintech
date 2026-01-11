import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (data: any) => Promise<any>;
    logout: () => void;
    updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
            } catch (e) {
                console.error('Failed to parse user data');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<User> => {
        // This is now only used for non-OTP fallback
        const response = await api.post('/auth/login', { email, password });

        if (response.data.otp_required) {
            throw new Error('OTP required - use LoginPage OTP flow');
        }

        const { access_token, user_id, full_name, role } = response.data;

        const userData: User = {
            id: user_id,
            email,
            full_name,
            role: role || 'user'
        };

        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        return userData;
    };

    const register = async (data: any) => {
        const response = await api.post('/auth/signup', data);
        return response.data;
    };

    const logout = () => {
        try { api.post('/auth/logout'); } catch (e) { }
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (updatedUser: Partial<User>) => {
        const currentUser = user || {
            id: '',
            email: '',
            full_name: '',
            role: 'user' as const
        };

        const newUser = { ...currentUser, ...updatedUser } as User;
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
